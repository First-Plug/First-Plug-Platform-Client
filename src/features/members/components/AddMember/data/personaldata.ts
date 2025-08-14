export const personalData = {
  fields: [
    {
      name: "firstName",
      title: "First Name*",
      type: "text",
      placeholder: "First Name",
      errorMessage: "First name is required"
    },
    {
      name: "lastName",
      title: "Last Name*",
      type: "text",
      placeholder: "Last Name",
      errorMessage: "Last name is required"
    },
    {
      name: "email",
      title: "Assigned Email*",
      type: "email",
      placeholder: "Assigned Email",
      errorMessage: "Email is required"
    },
    {
      name: "birthDate",
      title: "Date of Birth",
      type: "date"
    },
    {
      name: "personalEmail",
      title: "Personal Email",
      type: "email",
      placeholder: "Personal Email",
      errorMessage: "Please enter a valid email address"
    },
    {
      name: "phone",
      title: "Phone Number",
      type: "text",
      placeholder: "+(54) 9 (11) [xxxxxxxx]"
    },
    {
      name: "dni",
      title: "DNI/CI/Passport",
      type: "text",
      placeholder: "DNI",
      errorMessage: "DNI cannot be longer than 20 characters"
    }
  ]
};
