import * as nodemailer from 'nodemailer'

/**
 * Node Mailer client for send emails to users
 * @export
 * @class MailClient
 * @private @property {nodemailer.Transporter} _client
 */
class MailClient {
  private _client: nodemailer.Transporter

  constructor() {
    this._client = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PASSWORD
      }
    })
  }

  /**
   * Send an email to the target user with their authentication token
   * as part of the process when verifying user identities using the
   * /api/token endpoint of the API
   * @param {string} token
   * @param {string} email
   * @memberof MailClient
   */
  async send(token: string, email: string) {
    const opts = {
      from: '"United Operations" <uo.authenticator@gmail.com>',
      to: email,
      subject: 'Authentication Token',
      html: `
        You have recently submitted a mission to be added to the United Operations community mission list!
        <br><br>
        We just need to confirm your identity with this one-time-use token:
        <br><br>
        <span style="background: #000; color: #b19e71; font-size: 3em;">${token}</span>
        <br><br>
        This token should be entered in the appropriate field on the mission submission form, and will expire in 5 minutes!
        <br><br>
        - UO Authenticator
      `
    }

    await this._client.sendMail(opts)
  }
}

export default new MailClient()
