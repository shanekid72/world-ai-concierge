
import axios, { AxiosInstance } from 'axios';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

interface WorldAPIConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  baseUrl: string;
  sandbox?: boolean;
}

class WorldAPIClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private config: WorldAPIConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async fetchToken(): Promise<void> {
    const response = await axios.post<TokenResponse>(
      `${this.config.baseUrl}/auth/realms/cdp/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        username: this.config.username,
        password: this.config.password,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const data = response.data;
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;
  }

  private async ensureToken(): Promise<void> {
    if (!this.token || Date.now() >= this.tokenExpiry) {
      await this.fetchToken();
    }
  }

  public async createQuote(payload: any) {
    await this.ensureToken();
    const res = await this.axiosInstance.post('/amr/paas/api/v1_0/paas/quote', payload, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.data;
  }

  public async createTransaction(payload: any) {
    await this.ensureToken();
    const res = await this.axiosInstance.post('/amr/paas/api/v1_0/paas/createtransaction', payload, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.data;
  }

  public async confirmTransaction(transactionRefNumber: string) {
    await this.ensureToken();
    const res = await this.axiosInstance.post(
      '/amr/paas/api/v1_0/paas/confirmtransaction',
      { transaction_ref_number: transactionRefNumber },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    return res.data;
  }

  public async enquireTransaction(transactionRefNumber: string) {
    await this.ensureToken();
    const res = await this.axiosInstance.get('/amr/paas/api/v1_0/paas/enquire-transaction', {
      params: { transaction_ref_number: transactionRefNumber },
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return res.data;
  }
}

export default WorldAPIClient;
