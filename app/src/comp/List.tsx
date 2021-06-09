import React from 'react';

interface IProps {
  people: {
    name: string,
    height: number,
    url: string,
    note?: string 
  }[]
}

const List: React.FC<IProps> = ({ people }) => {
  return (
    <div>Here is a List</div>
  )
}

export default List