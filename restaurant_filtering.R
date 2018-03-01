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

#Write to CSV.

write.csv(Final_Restaurant_Set, "restaurants.csv")

