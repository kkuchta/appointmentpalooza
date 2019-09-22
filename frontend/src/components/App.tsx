import React from 'react';
import CoachSelector from './CoachSelector';
import SlotSelector from './SlotSelector';
import Api, { Slot } from '../api'
import './App.css';

interface State {
  slots?: Slot[]
  selectedCoach?: string
  selectedSlot?: Slot
}
class App extends React.Component<{}, State> {
  readonly state: State = {}
  onCoachSelect = (coach: string) => {
    console.log("Selected coach:", coach)
    this.setState({ selectedCoach: coach });
  }
  componentDidMount() {
    Api.getSlots().then((slots) => {
      this.setState({ slots: slots });
    });
  }
  getCoaches = () => {
    const { slots } = this.state

    if (slots == null) { return [] }
    const coachSet = slots.reduce(
      (coaches, slot: Slot) => coaches.add(slot.coach),
      new Set()
    )
    return Array.from(coachSet);
  }
  getSlots = () => {
    const slots = this.state.slots;
    if (slots == null) { return [] }

    const { selectedCoach } = this.state;

    // If no coach is selected, show all slots
    if(selectedCoach == null) { return slots }

    return slots.filter((slot) => selectedCoach.includes(slot.coach));
  }
  onSlotSelect = (slot: Slot) => {
    console.log('selected', slot)
    // TODO: show a loading indicator here while we're saving so the user has
    // some feedback to know their click worked.
    Api.saveAppointment(slot).then(() => this.setState({selectedSlot: slot}))
  }
  renderLoading() {
    return <div>Loading...</div>
  }
  renderUI() {
    const { selectedSlot } = this.state
    if (selectedSlot == null) {
      return <>
        <CoachSelector availableCoaches={this.getCoaches()} onCoachSelect={this.onCoachSelect} />
        <SlotSelector slots={this.getSlots()} onSlotSelect={this.onSlotSelect} />
      </>
    } else {
      return <div>
        selectedSlot = { selectedSlot.coach }, { selectedSlot.start}
      </div>
    }
  }
  render() {
    return (
      <div className="App">
        { this.state.slots == null ? this.renderLoading() : this.renderUI() }
      </div>
    );
  }
}

export default App;
