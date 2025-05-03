export default function formatDate(isoString) {
  const date = new Date(isoString);

  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = date.toLocaleDateString(undefined, options);

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedTime = `${hours}:${
    minutes < 10 ? "0" + minutes : minutes
  } ${ampm}`;

  return `${formattedDate} at ${formattedTime}`;
}
