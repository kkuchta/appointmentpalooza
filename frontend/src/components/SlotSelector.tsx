import React from 'react';
import Moment from 'moment';
import { Slot } from '../api'
import './SlotSelector.css';

// This should be less than or equal to the number of days for which the /slots
// api return slots.
const DAYS_TO_DISPLAY = 7;

// The length of each appointment.  This should match the length of the slots
// passed in via the slots parameter.
const INCREMENTS = [30, 'minutes'];

type Props = {
  slots: Slot[],
  onSlotSelect: (slots: Slot) => void
}

class SlotSelector extends React.Component<Props, {}> {

  // A list of momentjs objects for each of the next N days
  days() {
    const days = [];
    let time = Moment().startOf('day');
    for(let i = 0; i < DAYS_TO_DISPLAY; i++) {
      days.push(time.clone());
      time.add(1, 'days');
    }
    return days;
  }

  // If there are multiple coaches available for this period, that means the
  // user didn't select a coach already.  We assume this means they don't care
  // which coach they get, so just give them the first available one.
  onPeriodClick = (slots: Slot[]) => () => this.props.onSlotSelect(slots[0]);

  // Renders a clickable time, eg [12:30pm]
  renderPeriod(time: Moment.Moment, slots: Slot[]) {
    return <button key={time.toISOString()} onClick={this.onPeriodClick(slots)}>
      { time.format('h:mm a') }
    </button>;
  }

  // Render a whole day (consisting of a list of periods)
  renderDay(day: Moment.Moment) {
    // These are assumed to be sorted by start time
    const { slots } = this.props

    const periodElements = [];

    let time = day.clone().startOf('day');
    let last_slot_i = 0;
    let last_slot = slots[last_slot_i];
    const endOfDay = day.clone().endOf('day');

    // For each N-minute period, grab all the slots matching that period.
    while (time.isBefore(endOfDay)) {
      // Look for the first slot that starts on this period
      while(last_slot != null && Moment(last_slot.start).isBefore(time)) {
        last_slot_i++;
        last_slot = slots[last_slot_i];
      }

      // Grab all slots in this period
      let slotsForThisPeriod = []
      while(last_slot != null && Moment(last_slot.start).isSame(time)) {
        slotsForThisPeriod.push(last_slot)
        last_slot_i++;
        last_slot = slots[last_slot_i];
      }

      // If we have at least one coach available for this period, render is as
      // an available option
      if (slotsForThisPeriod.length > 0) {
        periodElements.push(this.renderPeriod(time.clone(), slotsForThisPeriod));
      }

      // Skip forward to the next N-minute period
      time.add(...INCREMENTS);
    }

    return <div className='day' key={day.toISOString()}>
      <h3>{ day.format('dddd') }</h3>
      { periodElements }
    </div>;
  }
  render() {
    return (
      <div className='slotSelector'>
        { this.days().map((day, i) => this.renderDay(day)) }
      </div>
    );
  }
}

export default SlotSelector;
