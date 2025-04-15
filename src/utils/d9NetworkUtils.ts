
// Utility functions for D9 Network operations

/**
 * Validates if a given country exists in the D9 Network
 */
export const isValidD9Country = (country: string): boolean => {
  return Object.keys(d9NetworkData.countries).includes(country.toLowerCase());
};

/**
 * Detects service type from message content
 */
export const detectServiceType = (message: string): string | null => {
  message = message.toLowerCase();
  if (message.includes("payout") || message.includes("send") || message.includes("transfer")) {
    return "payout";
  } else if (message.includes("payin") || message.includes("receive") || message.includes("collect")) {
    return "payin";
  }
  return null;
};

/**
 * Gets available services for a country
 */
export const getCountryServices = (country: string): string[] => {
  const countryData = d9NetworkData.countries[country.toLowerCase()];
  return countryData ? countryData.services : [];
};

import { d9NetworkData } from './d9NetworkData';

