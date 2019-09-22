import React from 'react';
import './CoachSelector.css';

type Props = {
  availableCoaches: any[],
  onCoachSelect: (coach: string) => void
}

const CoachSelector: React.FC<Props> = (props) => {
  const onCoachClick = (coach: string) => {
    props.onCoachSelect(coach);
  }
  const renderCoachButton = (coach: string) => {
    return <div key={coach}>
      <button onClick={() => onCoachClick(coach)}>{coach}</button>
    </div>;
  }

  return (
    <div className='coachSelector'>
      <h2>Filter by coach</h2>
      <div className='coachList'>
        { props.availableCoaches.map((coach) => renderCoachButton(coach))}
      </div>
    </div>
  );
}

export default CoachSelector;
