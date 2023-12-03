function parseFiveMColorCodes(text) {
    const caretColors = {
        '^0': 'black',
        '^1': 'red',
        '^2': 'green',
        '^3': 'yellow',
        '^4': 'blue',
        '^5': 'lightblue',
        '^6': 'purple',
        '^7': 'white',
        '^8': 'orange',
        '^9': 'grey',
    };

    const tildeColors = {
        '~r~': 'red',
        '~g~': 'green',
        '~b~': 'blue',
        '~y~': 'yellow',
        '~p~': 'purple',
        '~o~': 'orange',
        '~c~': 'grey',
        '~m~': 'darkgrey',
        '~u~': 'black',
        '~w~': 'white',
        '~s~': 'silver',
        '~q~': 'pink',
        '~t~': 'teal',
        '~l~': 'lime',
        '~n~': 'brown',
        '~h~': 'hotpink',
    };

    Object.keys(caretColors).forEach(code => {
        const color = caretColors[code];
        const regex = new RegExp(`\\${code}`, 'g');
        text = text.replace(regex, `<span style="color:${color}">`);
    });

    Object.keys(tildeColors).forEach(code => {
        const color = tildeColors[code];
        const regex = new RegExp(code, 'g');
        text = text.replace(regex, `</span><span style="color:${color}">`);
    });

    text += '</span>';
    text = text.replace(/(\^[0-9])|(~[rgbyopcmuwsqtlhn]~)/g, '');
    text = text.replace('</span>', '');

    return text;
}

const activeNotifications = {};

window.addEventListener('message', function(event) {
    let data = event.data;
    if (data !== null && data.action === "show_notification" && data.type.match(/^(yellow|green|red|grey|purple|blue)$/)) {
        const { type, title, body } = {
            type: data.type,
            title: data.title,
            body: data.body
        };

        const key = `${type}_${title}_${body}`;
        if (activeNotifications[key]) {
            const notification = activeNotifications[key];
            notification.remainingTime = Math.min(notification.remainingTime + 7500, 15000);
            clearTimeout(notification.timeoutId);
            notification.timeoutId = setTimeout(() => {
                notification.element.remove();
                delete activeNotifications[key];
                if (notificationElement) notificationElement.remove();
            }, notification.remainingTime);
            return;
        }

        activeNotifications[key] = true;

        const notificationElement = document.createElement('div');
        notificationElement.classList.add('notification');
        notificationElement.dataset.type = type;
        notificationElement.dataset.title = title;
        notificationElement.dataset.body = body;

        document.getElementById('notification-area').appendChild(notificationElement);

        const id_notification = document.createElement("div");
        let id = Math.random().toString(36).substr(2, 10);
        id_notification.setAttribute("id", id);
        id_notification.classList.add("notif");

        const notificationHeader = document.createElement("div");
        notificationHeader.classList.add("notification_header");

        const iconName = data.icon;
        const mainIcon = document.createElement("div");
        mainIcon.classList.add("data_icon");
        mainIcon.innerHTML = '<i class="' + iconName + ' fa-2x' + '"></i>';

        const titleElement = document.createElement("div");
        titleElement.classList.add("notification_title");
        titleElement.innerText = parseFiveMColorCodes(data.title);

        notificationHeader.appendChild(mainIcon);
        notificationHeader.appendChild(titleElement);

        const bodyElement = document.createElement("div");
        bodyElement.classList.add("notification_body");
        bodyElement.innerHTML = parseFiveMColorCodes(data.body);

        const notification = document.createElement("div");
        notification.classList.add("notification", data.type);
        notification.appendChild(notificationHeader);
        notification.appendChild(bodyElement);

        id_notification.appendChild(notification);

        const notificationArea = document.getElementById("notification-area");
        notificationArea.appendChild(id_notification);

        let remainingTime = Math.max(data.body.length * 150, 7500);
        
        const timeoutId = setTimeout(() => {
            id_notification.remove();
            delete activeNotifications[key];
            notificationElement.remove();
        }, remainingTime);

        activeNotifications[key] = {
            element: id_notification,
            timeoutId: timeoutId,
            remainingTime: remainingTime
        };
    }
})
