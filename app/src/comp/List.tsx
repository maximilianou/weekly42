import React from 'react';
import { IState as IProps} from '../App';


const List: React.FC<IProps> = ({ people }) => {
  const renderList = (): JSX.Element[] => {
    return people.map( (person) => {
      return (
        <li>
          <article className='List'>
            <header className='List-header'>
              <img className='List-img' src={person.url} />
              <h2>{person.name}</h2></header>
            <p className='List-note'>{person.note}</p>
          </article>
        </li>
      )
    })
  }
  
  return (
    <ul>
      {renderList()}
    </ul>
  )
}

export default List