function handleApiError(error: any) {
  const errorMessage = error.response?.data?.message || "";

  if (errorMessage.includes("DNI")) {
    return "errorDniInUse";
  } else if (errorMessage.includes("Email")) {
    return "errorEmailInUse";
  } else {
    return "errorCreateMember";
  }
}

export default handleApiError;
