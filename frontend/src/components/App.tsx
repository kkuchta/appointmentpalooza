import React from 'react';
import Moment from 'moment';
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

  componentDidMount() {
    // Load coach slots immediately
    Api.getSlots().then((slots) => {
      this.setState({ slots: slots });
    });
  }

  onCoachSelect = (coach: string) => {
    console.log("Selected coach:", coach)
    this.setState({ selectedCoach: coach });
  }

  // Gets a list of coach names
  getCoaches = () => {
    const { slots } = this.state

    if (slots == null) { return [] }
    const coachSet = slots.reduce(
      (coaches, slot: Slot) => coaches.add(slot.coach),
      new Set()
    )
    return Array.from(coachSet);
  }

  // Get all slots, filtered by the currently selected coach
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
      const formattedStart = Moment(selectedSlot.start).format('h:mma [on] dddd [the] Mo');
      return <div className='appointmentMade'>
        <div className='appointmentConfirmation'>
          <h1>Your appointment is all set!</h1>
          <p>
            You'll be talking to <b>{ selectedSlot.coach }</b><br /> at <b>{ formattedStart }</b>.
          </p>
        </div>
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
