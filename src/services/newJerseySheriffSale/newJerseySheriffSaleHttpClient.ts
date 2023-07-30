import { HttpClient, CreateHttpClientConfig } from '../http/httpClient';

export class NewJerseySheriffSaleHttpClient extends HttpClient {
  private static instance: NewJerseySheriffSaleHttpClient;

  public aspSessionId: string;
  public clientConfig: CreateHttpClientConfig;

  public constructor() {
    super({
      baseURL: 'https://salesweb.civilview.com',
      withCredentials: true,
    });

    this.axiosInstance.interceptors.request.use(
      (req) => {
        if (this.aspSessionId) {
          req.headers['Cookie'] = `ASP.NET_SessionId=${this.aspSessionId}`;
        }

        return req;
      },
      (error) => error,
    );

    this.axiosInstance.interceptors.response.use(
      (req) => {
        if (!this.aspSessionId) {
          const cookies = req.headers['set-cookie'];

          if (cookies) {
            const aspSessionId = cookies[0].split(';')[0].split('=')[1];

            this.aspSessionId = aspSessionId;
          }
        }

        return req;
      },
      (error) => error,
    );

    this.aspSessionId;
  }

  public static createClient() {
    if (NewJerseySheriffSaleHttpClient.instance) {
      return this.instance;
    }

    this.instance = new NewJerseySheriffSaleHttpClient();

    return this.instance;
  }

  public static getClient() {
    const client = NewJerseySheriffSaleHttpClient.createClient();

    return client;
  }
}
