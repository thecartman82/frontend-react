import React from 'react';

const NumberInput = ({label, placeholder, value, onChange}) => {
	const id = 'id' + label.replace(/\s/, '_');
	return (
		<div className={'form-group NumberInput'}>
			<label htmlFor={id}>{label}:</label>{' '}
			<input type="number" className="form-control" id={id} placeholder={placeholder} value={value}
				onChange={(e) => onChange(Number(e.target.value) || 0)} />
		</div>
	);
};

export default NumberInput;