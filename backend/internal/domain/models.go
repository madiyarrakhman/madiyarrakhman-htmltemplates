package domain

import (
	"time"
)

type Invitation struct {
	ID            int                    `json:"id"`
	UUID          string                 `json:"uuid"`
	PhoneNumber   string                 `json:"phoneNumber"`
	TemplateCode  string                 `json:"templateCode"`
	Lang          string                 `json:"lang"`
	Content       map[string]interface{} `json:"content"`
	GroomName     string                 `json:"groomName"`
	BrideName     string                 `json:"brideName"`
	EventDate     string                 `json:"eventDate"`
	EventLocation string                 `json:"eventLocation"`
	ShortCode     string                 `json:"shortCode"`
	CreatedAt     time.Time              `json:"createdAt"`
	UpdatedAt     time.Time              `json:"updatedAt"`
}

type RSVPResponse struct {
	ID             int       `json:"id"`
	InvitationUUID string    `json:"invitationUuid"`
	GuestName      string    `json:"guestName"`
	Attendance     string    `json:"attendance"`
	GuestCount     int       `json:"guestCount"`
	CreatedAt      time.Time `json:"createdAt"`
}

type Template struct {
	ID       int    `json:"id"`
	Code     string `json:"code"`
	Name     string `json:"name"`
	IsActive bool   `json:"isActive"`
}

type AdminStats struct {
	TotalInvitations int `json:"totalInvitations"`
	TotalRSVPs       int `json:"totalRSVPs"`
	TotalGuests      int `json:"totalGuests"`
}

type InvitationWithStats struct {
	Invitation
	RSVPCount      int    `json:"rsvpCount"`
	ApprovedGuests int    `json:"approvedGuests"`
	TemplateName   string `json:"templateName"`
}

type InvitationRepository interface {
	GetByUUID(uuid string) (*Invitation, error)
	GetByShortCode(code string) (*Invitation, error)
	Create(inv *Invitation) error
	AddRSVP(rsvp *RSVPResponse) error
}

type AdminRepository interface {
	GetStats() (*AdminStats, error)
	GetInvitationsList() ([]InvitationWithStats, error)
	GetTemplates() ([]Template, error)
}
