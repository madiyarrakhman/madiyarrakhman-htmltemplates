# 🚀 Platform User & Management Guide

This guide provides instructions on how to manage your Wedding Invitation Platform and use its API.

[Russian Version (Русская версия)](PLATFORM_GUIDE_RU.md)

---

## 🔐 Admin Dashboard

The visual interface for managing all invitations.
- **URL**: `https://your-domain.com/admin`
- **Login/Password**: These are set via Environment Variables (`ADMIN_USERNAME` and `ADMIN_PASSWORD`).
- **Functionality**: Create new invitations, view RSVP statistics, and manage existing records.

## 🔐 Access Keys

- **Private API Key**: Used for sensitive operations like creating and editing invitations. Use this key in your headers as `x-api-key`.
- **Frontend Public Key**: Automatically generated to allow the frontend to fetch invitation data and submit RSVP responses safely.

## 🛠 API Endpoints Reference

### 1. Create Invitation
Generate a new invitation for a client.
- **Method**: `POST`
- **Path**: `/api/invitations`
- **Authentication**: `x-api-key: YOUR_PRIVATE_KEY`
- **Payload Example**:
```json
{
  "phoneNumber": "+1234567890",
  "templateCode": "silk-ivory",
  "lang": "en",
  "groomName": "John",
  "brideName": "Jane",
  "eventDate": "2026-08-15 17:00:00",
  "eventLocation": "Crystal Palace, New York",
  "content": "Join us for our special day!"
}
```

### 2. Fetch Invitation
Used by the frontend to display data for a specific guest link.
- **Method**: `GET`
- **Path**: `/api/invitations/:uuid`

### 3. Submit RSVP
Guest response submission.
- **Method**: `POST`
- **Path**: `/api/rsvp/:uuid`
- **Payload**:
```json
{
  "guestName": "Robert Downey",
  "attendance": "yes",
  "guestCount": 2
}
```

## 🤖 Automation with n8n / Zapier

The platform is designed for seamless automation:
1. Use an **HTTP Request** node.
2. Send a `POST` request to `/api/invitations` with your API Key.
3. Use the returned `fullUrl` to automatically send invitations via WhatsApp, SMS, or Email.

## 🌍 Workflow Lifecycle

1. **Generation**: Create an invitation (via Admin Panel or API).
2. **Distribution**: Share the unique link `domain.com/i/UUID` with guests.
3. **Engagement**: Guests view the personalized interactive site.
4. **RSVP**: Guests submit their attendance status.
5. **Monitoring**: Track all responses in real-time on your Admin Dashboard.

## 🗄 Database Architecture

- **`templates`**: Directory of available UI designs.
- **`invitations`**: Stores primary data, personalized content, and internal UUIDs.
- **`rsvp_responses`**: Linked to invitations, stores guest names and counts.

---
For technical questions, please consult the `README.md` or the `api/README.md`.
