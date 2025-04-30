
// Regular expressions for matching D9 Network service inquiries
export const D9_NETWORK_PATTERNS = {
  PAYOUT: /(do you (have|support|offer)|is there|can i) (payout|payment|remittance|transfer|send money)( service| option|)? (to|in|for) ([a-z\s]+)(\?)?/i,
  PAYIN: /(do you (have|support|offer)|is there|can i) (payin|collection|receive)( service| option|)? (from|in|for) ([a-z\s]+)(\?)?/i,
  SERVICE: /(what|which) (service|option)s? (?:do you|are|is) (have|available|supported|offered) (in|for) ([a-z\s]+)(\?)?/i,
  COUNTRY_ONLY: /^([a-z\s]+)$/i
};

