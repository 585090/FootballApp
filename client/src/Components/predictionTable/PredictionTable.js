import React, { useEffect, useState } from 'react';
import './PredictionTable.css';
import { DndContext, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import PredictionRow from './PredictionRow';

const PredictionTable = ( {competition} ) => {

  const [teamData, setTeamData] = useState([]);
  
  useEffect(() => {
    console.log('teamData changed:', teamData);
  }, [teamData]);

  const handleSavePrediction = async () => {
    try {
      const predictedStandings = teamData.map((team, index) => ({
        teamId: team.teamId,
        predictedStanding: index+1
      })) 

      const player = JSON.parse(localStorage.getItem('player'));
      const response = await fetch(`http://localhost:5000/api/prediction/predictTable`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: player.email,
          competition,
          season: '2026',
          prediction: predictedStandings})
      })

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

    } catch (error) {
      console.error("Error saving prediction:", error);
    }
  }


  useEffect(() => {
    const getTeamsAndPrediction = async () => {
      try {
        const player = JSON.parse(localStorage.getItem('player'));

        // Fetch all teams
        const teamsRes = await fetch(`http://localhost:5000/api/teams/${competition}`);
        const teams = await teamsRes.json();

        // Fetch saved prediction
        const predictionRes = await fetch(
          `http://localhost:5000/api/prediction/predictTable?email=${player.email}&competition=${competition}&season=2026`
        );

        if (predictionRes.ok) {
          const prediction = await predictionRes.json();

          // Create a quick lookup map
          const orderMap = new Map(prediction.map(p => [p.teamId, p.predictedStanding]));

          // Sort teams by predictedIndex if available
          teams.sort((a, b) => {
            const aIndex = orderMap.get(a.teamId) ?? Infinity;
            const bIndex = orderMap.get(b.teamId) ?? Infinity;
            return aIndex - bIndex;
          });
        }

        setTeamData(teams);
      } catch (error) {
        console.error('Error fetching teams or prediction:', error);
      }
  };

  getTeamsAndPrediction();
}, [competition]);


  const getTeamPos = (position) => {
    return teamData.findIndex(team => team.teamId === position)
  }

  const handleDragEnd = (e) => {
    const {active, over} = e;
    console.log('Drag ended:', { activeId: active.id, overId: over?.id })

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
        <SortableContext items={teamData.map(team => team.teamId)} strategy={verticalListSortingStrategy} >
          {teamData.map((team, index) => (
            <PredictionRow key={team.teamId}
              id={team.teamId} 
              teamName={team.teamName}
              prevSeasonRank={team.prevSeasonRank} 
              logo={team.logo}
              index={index} 
            />
          ))}
        </SortableContext>
      </DndContext>
      <button onClick={handleSavePrediction} className='SavePredictions-button' >Save</button>
    </div>

  );
};

export default PredictionTable;