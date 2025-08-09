import { useSortable } from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities';
import './PredictionTable.css'

const PredictionRow = (props) => {
    const { id, teamName, prevSeasonRank, logo, index } = props;
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: id})
    
    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition
    };

    return (
        <div className='Team-row'
            ref={setNodeRef} 
            {...attributes} 
            {...listeners}
            style={style}
            >
            <img className="TeamLogo" src={logo} alt="error" />
            <span className='TeamName' >{teamName}</span>
            <span className='TeamPrevRank' >{prevSeasonRank || 'Promoted'}</span>
            <span className='TeamPredRank' >{index+1}</span>
            <span className='DragIcon'>☰</span>
        </div>
    )
}

export default PredictionRow;