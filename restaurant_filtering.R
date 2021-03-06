#Filters the dataset down to restaurants with active licences.

Restaurant_Licenses <- subset(Business_Licenses, (Business_Licenses$Classification_Code == "RESTAM" | Business_Licenses$Classification_Code == "RESTZ" | Business_Licenses$Classification_Code == "RESTIT" | Business_Licenses$Classification_Code == "FVV"))

# Filter out nonactive licenses

Current_Licenses <- subset(Restaurant_Licenses, Restaurant_Licenses$License_Status != "IN" & Restaurant_Licenses$License_Status != "VO" & Restaurant_Licenses$License_Status != "OB")


#Grab only the attributes we want. 

Final_Restaurant_Set <- data.frame(
  Name = Current_Licenses$Business_Name,
  Address = Current_Licenses$Street_Address,
  City = Current_Licenses$City,
  State = Current_Licenses$State,
  Zip = Current_Licenses$Zip,
  Phone_Number = Current_Licenses$Business_Phone_Number
  
)

#Take out duplicates based on the business name.

Restaurant_Set_Name_Dedupe <- Final_Restaurant_Set[!duplicated(Final_Restaurant_Set$Name),]

#Create an alternate data set based on the business address.

Restaurant_Set_Address_Dedupe <- Final_Restaurant_Set[!duplicated(Final_Restaurant_Set$Address),]

#Create a set that is a union of the name and address dedupes for a more comprehensive version of the dataset.
# (uses the dplyr package)

Comp_Set <- dplyr::union(Restaurant_Set_Address_Dedupe, Restaurant_Set_Name_Dedupe)

# Create another alternate data set based on phone number.

Restaurant_Set_Phone_Dedupe <- Final_Restaurant_Set[!duplicated(Final_Restaurant_Set$Phone_Number),]

# Using the version of the union set that has the category of chain vs. local, filter out the chains.

local_restaurants <- subset(restaurants_union_Class, restaurants_union_Class$`Local or Chain` == 'Local')

#Write to CSV.

write.csv(Restaurant_Set_Name_Dedupe, "restaurants_name.csv")

write.csv(Restaurant_Set_Address_Dedupe, "restaurants_address.csv")

write.csv(Comp_Set, "restaurants_union.csv")

write.csv(Restaurant_Set_Phone_Dedupe, "restaurants_phone.csv")

write.csv(local_restaurants, "local_restaurants.csv")

