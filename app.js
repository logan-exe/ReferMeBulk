const express = require("express");
const app = express();
const User = require("./Models/userModal");
const Contact = require("./Models/contactModal");
const sgMail = require("@sendgrid/mail");
const multer = require("multer");
const streamifier = require("streamifier");
const csv = require("csv-parser");
const validator = require("email-validator");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

app.use(express.json());

sgMail.setApiKey(process.env.SG_MAIL_API_KEY);

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/", async (req, res) => {
  res.send("Hello world!");
});

app.post("/addBulkContacts", async (req, res) => {
  try {
    const { userId } = req.query;

    const issuer = await User.find({ _id: userId });

    upload.single("file")(req, res, (error) => {
      if (error) {
        console.error("Error uploading file:", error);
        return res.status(400).json({ message: "Error uploading file" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileBuffer = req.file.buffer;

      const stream = streamifier.createReadStream(fileBuffer);
      const incorrectEmails = [];
      const FinalList = [];
      const FilteredData = [];
      const currentDate = new Date();
      const processedEmails = new Set();

      stream
        .pipe(csv())
        .on("headers", async (headers) => {
          const trimmedHeaders = headers.map((header) => header.trim());
          const expectedHeaders = [
            "firstname",
            "lastname",
            "email",
            "phone",
            "referral_amount",
          ];
          const missingHeaders = expectedHeaders.filter(
            (header) => !trimmedHeaders.includes(header)
          );

          if (missingHeaders.length > 0) {
            return res.status(400).json({
              message:
                "Column names in csv must match column names in csv temaplate",
            });
          }
        })
        .on("data", async (data) => {
          // Normalize the data object keys by trimming them
          const normalizedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key.trim(), value])
          );

          if (processedEmails.has(normalizedData.email)) {
            incorrectEmails.push(normalizedData);
            return; // Skip processing duplicate email
          }
          processedEmails.add(normalizedData.email);
          const isValidEmail = validator.validate(normalizedData.email);
          try {
            if (
              normalizedData.firstname.length > 1 &&
              normalizedData.lastname.length > 1 &&
              isValidEmail
            ) {
              FilteredData.push({
                ...normalizedData,
                phone: normalizedData.phone || "",
                referral_amount: normalizedData.referral_amount || 0,
              });
            } else {
              incorrectEmails.push(normalizedData);
              return; // Skip processing duplicate email
            }
          } catch (e) {
            console.log("error", e);
            return;
          }
        })
        .on("end", async () => {
          const promises = FilteredData.map(async (singleRow) => {
            try {
              const foundContact = await Contact.findOne({
                email: singleRow.email,
                user: userId,
              });

              if (foundContact) {
                return {
                  status: "fulfilled",
                  value: {
                    email: singleRow.email,
                    firstname: singleRow.firstname,
                    lastname: singleRow.lastname,
                    phone: singleRow.phone,
                  },
                };
              } else {
                let uniqueId = new mongoose.Types.ObjectId();
                FinalList.push({
                  _id: uniqueId,
                  firstname: singleRow.firstname,
                  lastname: singleRow.lastname,
                  email: singleRow.email,
                  phone: singleRow.phone || "",
                  referral_link: `https://referme.uk/referral/${userId}/${uniqueId}`,
                  user: userId,
                  referral_amount: singleRow.referral_amount || 0,
                  date: currentDate.toString(),
                });

                return {
                  status: "fulfilled",
                  value: null,
                };
              }
            } catch (error) {
              return {
                status: "rejected",
                reason: error,
              };
            }
          });

          const results = await Promise.allSettled(promises);

          results.forEach((result) => {
            if (result.status === "fulfilled" && result.value.value != null) {
              incorrectEmails.push(result.value.value);
            } else if (result.status === "rejected") {
              console.error("Error:", result.reason);
            }
          });

          let pendingContacts = FinalList.length;
          const user = await User.findById(userId);
          try {
            user.pendingContactsToUpload = pendingContacts;
            user.totalContactsBeforeUpload = user.contacts.length;
            user.totalContactsToUpload = pendingContacts;
            user.isUploadingContacts = true;
            await user.save();
          } catch (err) {
            return res
              .status(200)
              .json({ message: "Error in saving pending Contacts" });
          }

          res.status(200).json({
            message: "Contacts added successfully",
            incorrectEmails: incorrectEmails,
          });

          const contactDocuments = FinalList.map((row) => ({
            _id: row._id,
            firstname: row.firstname,
            lastname: row.lastname,
            email: row.email,
            phone: row.phone || "",
            referral_link: row.referral_link,
            user: row.user,
            referral_amount: row.referral_amount,
            date: row.date,
          }));

          await Contact.insertMany(contactDocuments);

          const contactIds = contactDocuments.map((row) => ({
            contact_id: row._id,
          }));

          const userUpdate = {
            $push: { contacts: { $each: contactIds } },
            $set: {
              isUploadingContacts: false,
              pendingContactsToUpload: 0,
            },
          };

          await User.updateOne({ _id: userId }, userUpdate);

          const msg = {
            to: `${issuer[0].email}`, // Change to your recipient
            from: {
              name: "ReferMe",
              email: "contact@referme.uk",
            }, // Change to your verified sender
            subject: `Your Contacts has been added Sucessfully`,
            html: `
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <style>
                                @media only screen and (max-width: 600px) {
                                  /* Add your mobile-specific styles here */
                                }
                                body {
                                  font-family: Arial, sans-serif;
                                  line-height: 1.5;
                                  margin: 0;
                                  padding: 0;
                                }
                                .container {
                                  max-width: 600px;
                                  margin: 0 auto;
                                  padding: 20px;
                                  background-color: #f9f9f9;
                                }
                              </style>
                            </head>

                            <body style="margin: 0; padding: 0">
                              <table
                                role="presentation"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                                align="center"
                                width="100%"
                                class="container"
                                style="max-width: 600px"
                              >
                                <tr>
                                  <td style="padding: 40px 30px 40px 30px">
                                    <table
                                      role="presentation"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      width="100%"
                                    >
                                      <tr>
                                        <td style="text-align: center">
                                          <img
                                            src="https://referme-user-images.s3.eu-west-2.amazonaws.com/final-logo.png"
                                            alt="Company Logo"
                                            width="200"
                                            style="display: block; margin: 0 auto"
                                          />
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style="padding: 20px 0 30px 0; text-align: center">
                                          <h1 style="font-size: 24px; margin: 0">Dear ${issuer[0].firstname},</h1>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style="font-size: 16px; line-height: 22px">
                                          <p style="margin: 0 0 20px 0">
                                            Your contacts from the CSV list have successfully been added to your contacts list.
                                            Each contact now possesses a unique referral link that they can share with others, enabling them to provide you with referrals.
                                              For an overview of your updated contacts, please proceed to the Contacts page.
                                          </p>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </body>
                          </html>
                          `,
          };

          try {
            await sgMail.send(msg);
            console.log("Email sent");
          } catch (error) {
            console.error(error, "i am in the error of sending mail");
            // return res.send("failure");
          }
        });
    });
  } catch (e) {
    res.status(400).send("failure");
  }
});

app.get("/test", async (req, res) => {
  console.log("I am working");
  return res.status(200).json({ message: "This endpoint working fine" });
});

module.exports = app;
