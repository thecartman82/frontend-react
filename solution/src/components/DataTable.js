import React from 'react';

//{"index":104,"slot":8,"city":"Carleton Place","velocity":265.68},

const renderRow = (item) => {
	return (
		<tr key={item.index}>
			<td>{item.index}</td>
			<td>{item.slot || 0}</td>
			<td>{item.city || 'None'}</td>
			<td>{(item.velocity || 0).toFixed(2)}</td>
		</tr>
	);
};

const DataTable = ({data}) => {
	const rows = data.map(renderRow);
	return (
		<table className={'table table-striped DataTable'}>
			<thead>
			<tr>
				<th>Index</th>
				<th>Slot</th>
				<th>City</th>
				<th>Velocity</th>
			</tr>
			</thead>
			<tbody>
				{rows}
			</tbody>
		</table>
	);
};

export default DataTable;