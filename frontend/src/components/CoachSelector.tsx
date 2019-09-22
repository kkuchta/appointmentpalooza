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
    return <li key={coach}>
      <button onClick={() => onCoachClick(coach)}>{coach}</button>
    </li>;
  }

  return (
    <div className='coachSelector'>
      <ul>
        { props.availableCoaches.map((coach) => renderCoachButton(coach))}
      </ul>
    </div>
  );
}

export default CoachSelector;
