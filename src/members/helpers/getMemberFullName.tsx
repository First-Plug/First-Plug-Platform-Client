export const getMemberFullName = (member: {
  firstName: string;
  lastName: string;
}) => {
  return `${member.firstName} ${member.lastName}`;
};
