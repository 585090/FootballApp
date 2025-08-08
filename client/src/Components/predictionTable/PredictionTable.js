import React, { useState } from 'react';
import './PredictionTable.css';
import { DndContext, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import PredictionRow from './PredictionRow';

const PredictionTable = ( {competition} ) => {

  const [teamData, setTeamData] = useState([
    { id: 'team-1', teamName: 'Manchester United', prevSeasonRank: '15' },
    { id: 'team-2', teamName: 'Arsenal', prevSeasonRank: '2' },
    { id: 'team-3', teamName: 'Leeds', prevSeasonRank: null }
  ]);

  const getTeamPos = (position) => {
    return teamData.findIndex(team => team.id === position)
  }

  const handleDragEnd = (e) => {
    const {active, over} = e;

    if (active.id === over.id) return;

    setTeamData(teamData => {
      const originalPos = getTeamPos(active.id);
      const newPos = getTeamPos(over.id)

      return arrayMove(teamData, originalPos, newPos)
    })
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {distance: 5}
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )


  return (
    <div className='PredictionTable-container' >
      <div className='PredictionTable-title'>
        <h1> {`${competition || ''} predicted table`} </h1>
      </div>
      <div className='PredictionTable-header' >
        <span className='TeamName' > Team </span>
        <span className='TeamPrevRank' > Previous season rank </span>
        <span className='TeamPredRank' > Predicted rank </span>  
        <span className='DragIcon'></span>
      </div>
      <DndContext
        sensors={sensors} 
        onDragEnd={handleDragEnd} 
        collisionDetection={closestCorners}
      >
        <SortableContext items={teamData} strategy={verticalListSortingStrategy} >
          {teamData.map((team, index) => (
            <PredictionRow key={team.id} 
              id={team.id} 
              teamName={team.teamName}
              prevSeasonRank={team.prevSeasonRank} 
              index={index} 
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>

  );
};

export default PredictionTable;