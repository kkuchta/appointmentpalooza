import Moment from "moment";
import React from "react";
import Api, { Slot } from "../api";
import "./App.css";
import CoachSelector from "./CoachSelector";
import SlotSelector from "./SlotSelector";

interface State {
  slots?: Slot[];
  selectedCoach?: string;
  selectedSlot?: Slot;
}

class App extends React.Component<{}, State> {
  public readonly state: State = {};

  public componentDidMount() {
    // Load coach slots immediately
    Api.getSlots().then((slots) => {
      this.setState({ slots });
    });
  }

  public onCoachSelect = (coach: string) => {
    this.setState({ selectedCoach: coach });
  }

  // Gets a list of coach names
  public getCoaches = () => {
    const { slots } = this.state;

    if (slots == null) { return []; }
    const coachSet = slots.reduce(
      (coaches, slot: Slot) => coaches.add(slot.coach),
      new Set(),
    );
    return Array.from(coachSet);
  }

  // Get all slots, filtered by the currently selected coach
  public getSlots = () => {
    const slots = this.state.slots;
    if (slots == null) { return []; }

    const { selectedCoach } = this.state;

    // If no coach is selected, show all slots
    if (selectedCoach == null) { return slots; }

    return slots.filter((slot) => selectedCoach.includes(slot.coach));
  }

  public onSlotSelect = (slot: Slot) => {
    // TODO: show a loading indicator here while we're saving so the user has
    // some feedback to know their click worked.
    Api.saveAppointment(slot).then(() => this.setState({selectedSlot: slot}));
  }

  public renderLoading() {
    return <div>Loading...</div>;
  }

  public renderUI() {
    const { selectedSlot } = this.state;
    if (selectedSlot == null) {
      return <>
        <CoachSelector availableCoaches={this.getCoaches()} onCoachSelect={this.onCoachSelect} />
        <SlotSelector slots={this.getSlots()} onSlotSelect={this.onSlotSelect} />
      </>;
    } else {
      const formattedStart = Moment(selectedSlot.start).format("h:mma [on] dddd [the] Mo");
      return <div className="appointmentMade">
        <div className="appointmentConfirmation">
          <h1>Your appointment is all set!</h1>
          <p>
            You'll be talking to <b>{ selectedSlot.coach }</b><br /> at <b>{ formattedStart }</b>.
          </p>
        </div>
      </div>;
    }
  }

  public render() {
    return (
      <div className="App">
        { this.state.slots == null ? this.renderLoading() : this.renderUI() }
      </div>
    );
  }
}

export default App;
