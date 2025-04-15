
import { d9NetworkData } from './d9NetworkData';

// Get a response for a country service inquiry
export const getCountryServiceResponse = (country: string, serviceType: string | null): string | null => {
  const countryData = d9NetworkData.countries[country.toLowerCase()];
  if (!countryData) {
    return `I currently don't have specific information about services in ${country}. Would you like me to provide details about other countries where our services are available?`;
  }
  
  if (serviceType === "payout") {
    const services = countryData.services.join(", ");
    return `Yes, we do offer payout services to ${country} in ${countryData.currency}. Available service types include: ${services}. Would you like more information about any specific service type?`;
  } else if (serviceType === "payin") {
    if (countryData.region === "GCC" || country === "uk" || country === "canada" || 
        country === "malaysia" || country === "singapore" || country === "philippines") {
      return `Yes, we support payin (fund collection) services from ${country} in ${countryData.currency}. This allows you to collect funds from customers in this region. Would you like more details about this service?`;
    } else {
      return `Currently, we don't offer payin services from ${country}. Our payin services are available in GCC regions, UK, Canada, and select APAC countries. Would you like information about countries where payin is supported?`;
    }
  } else {
    // General service inquiry or just a country name mentioned
    const services = countryData.services.join(", ");
    const payinSupport = (countryData.region === "GCC" || country === "uk" || country === "canada" || 
                          country === "malaysia" || country === "singapore" || country === "philippines") 
                          ? "We also support payin (fund collection) from this country." 
                          : "Payin services are not currently available from this country.";
    
    return `For ${country} (${countryData.region}), we offer the following services in ${countryData.currency}: ${services}. ${payinSupport} Would you like more specific information?`;
  }
};
