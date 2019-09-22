import React from 'react';
import './CoachSelector.css';

type Props = {
  availableCoaches: any[],
  onCoachSelect: (coach: string) => void
}

type State = {
  selectedCoach?: string
}

class CoachSelector extends React.Component<Props, State> {

  readonly state: State = {}

  onCoachClick = (coach: string) => {
    this.setState({ selectedCoach: coach })
    this.props.onCoachSelect(coach);
  }

  renderCoachButton = (coach: string) => {
    const className = (this.state.selectedCoach === coach) ? 'selected' : '';
    return <div key={coach}>
      <button onClick={() => this.onCoachClick(coach)} className={className}>
        {coach}
      </button>
    </div>;
  }

  render() {
    return (
      <div className='coachSelector'>
        <h2>Filter by coach</h2>
        <div className='coachList'>
          { this.props.availableCoaches.map((coach) => this.renderCoachButton(coach))}
        </div>
      </div>
    );
  }
}

export default CoachSelector;
