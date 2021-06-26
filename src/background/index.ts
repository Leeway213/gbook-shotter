console.log('Hey! This code is executed in the background, you will not see it in the browser console...');

chrome.runtime.onMessage.addListener(async (request, sender, res) => {
	const { type } = request;
	if (type === 'batch-bookmate') {
		const tasks = request.value;
		for (const task of tasks) {
			const tab = await new Promise<chrome.tabs.Tab>(resolve => {
				chrome.tabs.create({
					url: `https://reader.bookmate.com/${task}`,
				}, tab => {
					const listener = (msg: any) => {
						if (msg.type === 'content-loaded') {
							chrome.runtime.onMessage.removeListener(listener);
							resolve(tab);
						}
					};
					chrome.runtime.onMessage.addListener(listener);
				});
			});
			await new Promise((resolve, reject) => {
				if (tab.id) {
					chrome.tabs.sendMessage(tab.id, { type: 'start-bookmate', bookId: task });
					const listener = (msg: any) => {
						const { type, status } = msg;
						if (type === 'start-bookmate' && status === 'complete') {
							chrome.runtime.onMessage.removeListener(listener);
							resolve(undefined);
						}
					};
					chrome.runtime.onMessage.addListener(listener);
				} else {
					reject('tab has no id: ' + tab.url);
				}
			});
		}
	}
});
