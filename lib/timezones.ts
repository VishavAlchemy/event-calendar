interface Timezone {
  value: string;
  label: string;
}

const timezones: Timezone[] = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "Europe/London", label: "British Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Time (JST)" },
  { value: "Asia/Shanghai", label: "China Time (CST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  { value: "Asia/Dubai", label: "Gulf Time (GT)" },
  { value: "Asia/Kolkata", label: "India Time (IST)" },
];

export default timezones; 