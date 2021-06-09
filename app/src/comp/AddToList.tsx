import React, { useState } from 'react';
import { IState as Props} from '../App';

interface IProps{
  people: Props["people"],
  setPeople: React.Dispatch<React.SetStateAction<Props["people"]>>
}


const AddToList: React.FC<IProps> = ({people, setPeople}) => {

  const [input, setInput] = useState({
    name: '',
    height: '',
    img: '',
    note: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setInput({
      ...input,
      [e.target.name]: e.target.value
    })
  }

  const handleClick = (): void => {
    if( !input.name || !input.height || !input.img ){
      return;
    }
    setPeople([
      ...people,
      {
        name: input.name,
        height: parseInt(input.height),
        url: input.img,
        note: input.note
      }
    ]);
    setInput({
      name: '',
      height: '',
      img: '',
      note: ''
      });
  }

  return (
    <div className='AddToList'>
      <input type='text' placeholder='Name'
            className='AddToList-input'
            value={input.name}
            onChange={handleChange}
            name='name'
      /> 
      <input type='number' placeholder='Height'
            className='AddToList-input'
            value={input.height}
            onChange={handleChange}
            name='height'
      />  
      <input type='text' placeholder='Image URL'
            className='AddToList-input'
            value={input.img}
            onChange={handleChange}
            name='img'
      />  
      <textarea placeholder='Note'
            className='AddToList-input'
            value={input.note}
            onChange={handleChange}
            name='note'
      />  
      <button className='AddToList-btn'
        onClick={handleClick}
      >Add To List</button>
    </div>
  )
}

export default AddToList;