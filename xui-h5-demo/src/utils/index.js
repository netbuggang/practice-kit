import moment from 'moment';

export const getUrlParam = (key, url = window.location.href) => {
    const search = url.split('?') && url.split('?')[1];
    if (search) {
        const params = search.split('&');
        const data = {};
        params.forEach((it) => {
            const param = it && it.split('=');
            if (param.length === 2) {
                const [k, v] = param;
                data[k] = v;
            }
        });
        return data[key] || '';
    }

    return '';
};

export const getNowDate = () => {
    return moment(new Date().getTime()).format('HH:mm');
};

const getLastDom = (container) => {
    const lastDom = container.lastElementChild;
    if (lastDom?.lastElementChild) {
        return getLastDom(lastDom);
    }
    return lastDom;
};

export const scrollToBottom = ({ container }) => {
    if (container) {
        const lastDom = getLastDom(container);
        if (lastDom) {
            lastDom.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
};