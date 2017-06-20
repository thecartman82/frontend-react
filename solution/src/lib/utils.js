
export const fillData = (data, fromIndex, toIndex) => {
	const result = [];
	let i = 0;
	for (let index = fromIndex; index <= toIndex; index++) {
		if (data[i] && data[i].index === index) {
			result.push(data[i]);
			i++;
		} else {
			result.push({
				index
			});
		}
	}
	
	return result;
};