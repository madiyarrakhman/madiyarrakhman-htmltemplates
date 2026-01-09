export interface Invitation {
    id: string;
    templateId: string;
    groomName: string;
    brideName: string;
    eventDate: string; // ISO string
    eventLocation: string;
    story?: string;
    schedule?: {
        time: string;
        name: string;
        description: string;
    }[];
    content?: Record<string, any>; // Fallback for unstructured content
}
