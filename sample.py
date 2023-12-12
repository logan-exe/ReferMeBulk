from faker import Faker
import random
import csv

fake = Faker()

contacts = []
for _ in range(15000):
    firstname = fake.first_name()
    lastname = fake.last_name()
    email = fake.email()
    phone = fake.phone_number()
    referral_amount = round(random.uniform(10.00, 1000.00), 2)
    contacts.append((firstname, lastname, email, phone, referral_amount))

    csv_file_path = "test_contacts_100k.csv"

# Write the data to a CSV file
with open(csv_file_path, mode='w', newline='') as csv_file:
    csv_writer = csv.writer(csv_file)

    # Write the header row
    header = ["firstname", "lastname", "email", "phone", "referral_amount"]
    csv_writer.writerow(header)

    # Write the contact data
    csv_writer.writerows(contacts)

print(f"Data has been saved to {csv_file_path}")
