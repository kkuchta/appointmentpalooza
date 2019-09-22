const ENDPOINT = "http://localhost:4567";

export interface Slot {
  start: string;
  coach: string;
}

export default {
  getSlots: async (): Promise<Slot[]> => {
    const data = await fetch(ENDPOINT + "/slots");
    return data.json();
  },
  saveAppointment: async (slot: Slot) => {
    await fetch(ENDPOINT + "/appointments", {
      method: "POST",
      body: JSON.stringify(slot),
    });
  },
};
