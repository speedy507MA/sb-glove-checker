import { onRequest } from "../../../functions/api";

// Title Slap
$('.title-text')[0].addEventListener('mouseup', (e) => {
    let a = new Audio('cdn/audio/slap.mp3');
    a.play();
});

const usDropdown = $('.us-dropdown')[0];
usDropdown.style.height = '0';

let flipped = false;

function doChevron(e) {
    flipped = !flipped;
    if (flipped) {
        e.target.src = 'cdn/images/chevron.down.png';
        usDropdown.animate(
            [
                {
                    height: '0',
                    marginTop: '0'
                },
                {
                    height: '20vh',
                    marginTop: '2vh'
                }
            ],
            {
                duration: 1000,
                fill: 'forwards',
                easing: 'ease-in-out'
            }
        );
        setTimeout(function () {
            usDropdown.style.overflowY = 'auto';
            usDropdown.style.overflowX = 'clip';
        }, 1000);
    } else {
        e.target.src = 'cdn/images/chevron.right.png';
        usDropdown.animate(
            [
                {
                    height: '20vh',
                    marginTop: '2vh'
                },
                {
                    height: '0',
                    marginTop: '0'
                }
            ],
            {
                duration: 1000,
                fill: 'forwards',
                easing: 'ease-in-out'
            }
        );
        setTimeout(function () {
            usDropdown.style.overflow = 'clip';
        }, 1000);
    }
}

$('.uspc-chevron')[0].addEventListener('mouseup', (e) => doChevron(e));

function createListItem(player, requestData) {
    const item = document.createElement('li');
    item.className = 'usc-choice';
    const uschoiceIn = document.createElement('div');
    uschoiceIn.className = 'uschoice-in';
    const uscPhoto = document.createElement('div');
    uscPhoto.className = 'usc-photo';
    const uscImage = document.createElement('img');
    uscImage.className = 'usc-image';
    uscImage.setAttribute('identifier', crypto.randomUUID());
    const uscDetails = document.createElement('div');
    uscDetails.className = 'usc-details';
    const uscDisplayName = document.createElement('div');
    uscDisplayName.className = 'usc-displayname'
    const uscDN = document.createElement('span');
    uscDN.className = 'fredoka noselect';
    uscDN.innerText = player.displayName;
    const uscUsername = document.createElement('div');
    uscUsername.className = 'usc-username';
    const uscUN = document.createElement('span');
    uscUN.className = 'fredoka noselect';
    uscUN.innerText = '(@' + player.name + ')';
    requestData.push({
        requestId: uscImage.getAttribute('identifier'),
        targetId: player.id,
        type: 'AvatarHeadShot',
        size: '420x420',
        isCircular: true
    });

    uscUsername.appendChild(uscUN);
    uscDisplayName.appendChild(uscDN);
    uscDetails.appendChild(uscDisplayName);
    uscDetails.appendChild(uscUsername);
    uscPhoto.appendChild(uscImage);
    uschoiceIn.appendChild(uscPhoto);
    uschoiceIn.appendChild(uscDetails);
    item.appendChild(uschoiceIn);

    $('.us-choices')[0].appendChild(item);

    item.addEventListener('mouseup', (e) => {
        doChevron({ target: $('.uspc-chevron')[0] });
        $('.uspdn-display')[0].innerText = player.displayName;
        $('.uspdn-at')[0].innerText = '(@' + player.name + ')';
        $('.uspdp')[0].src = uscImage.src;
        $('#select-details')[0].setAttribute('userId', player.id);
    });
}

// fetchBadges action
$('.user-lookup-form')[0].addEventListener('submit', async (e) => {
    e.preventDefault();
    $('.us-choices').empty();
    const btn = e.submitter;
    const fd = new FormData(e.target);
    const username = fd.get('username');
    if (username.length < 3) {
        $(btn).find('span')[0].innerText = 'Too Short';
        setTimeout(function () {
            $(btn).find('span')[0].innerText = 'Search';
        }, 1000);
        return;
    }
    let response = await fetch('https://users.rotunnel.com/v1/usernames/users', {
        method: 'POST',
        body: JSON.stringify({
            usernames: [username],
            excludeBannedUsers: false
        })
    });

    let rjson = await response.json();
    let data = rjson.data;

    let requestData = [];

    if (data[0] == null) {
        // No exact match for the username so we'll do a search and ask to pick from the list.
        response = await fetch('https://users.rotunnel.com/v1/users/search?keyword=' + username);
        rjson = await response.json();
        data = rjson.data;
        if (data == null || data.length < 1) {
            $(btn).find('span')[0].innerText = 'Not Found';
            setTimeout(function () {
                $(btn).find('span')[0].innerText = 'Search';
            }, 1000);
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const player = data[i];
            if (i == 0) {
                $('.uspdn-display')[0].innerText = player.displayName;
                $('.uspdn-at')[0].innerText = '(@' + player.name + ')';
                $('#select-details')[0].setAttribute('userId', player.id);
            }
            createListItem(player, requestData);
        }
    } else {
        for (let i = 0; i < data.length; i++) {
            const player = data[i];
            if (i == 0) {
                $('.uspdn-display')[0].innerText = player.displayName;
                $('.uspdn-at')[0].innerText = '(@' + player.name + ')';
                $('#select-details')[0].setAttribute('userId', player.id);
            }
            createListItem(player, requestData);
        }
    }

    let tresponse = await fetch('https://roblox-thumbnail-api.bqbo.workers.dev/v1/batch', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(requestData)
    });
    let tjson = (await tresponse.json()).data;

    $('.uselect')[0].style.display = 'block';

    for (let i = 0; i < tjson.length; i++) {
        const result = tjson[i];
        if (i == 0) {
            $('.uspdp')[0].src = result.imageUrl;
        }
        if (result.requestId == null) continue;
        $('.us-choices').find(`img[identifier='${result.requestId}'`)[0].src = result.imageUrl || 'cdn/images/notfound.svg';
    }

    $('#pc')[0].style.display = 'block';
    $('#pc-1')[0].style.display = 'flex';
});

$('#badgeCheck')[0].addEventListener('mouseup', async () => {
    $('.badge-grid').empty();
    $('#pc-2')[0].style.display = 'flex';

    const userId = $('#select-details')[0].getAttribute('userId');
    const gloveData = [];
    const thumbnailData = [];
    const inventoryData = [];
    let playerData;

    const sleep = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    async function rateLimitedFetch(url, timeToWait, body = null) {
        await sleep(timeToWait[0]);

        const response = body == null
            ? await fetch(url)
            : await fetch(url, {
                method: 'POST',
                body
            });

        if (response.status === 429) {
            const resetTime =
                Number(response.headers.get('x-ratelimit-reset')?.split(',')[0] ?? 0) * 1000 + 100;

            timeToWait[0] = resetTime;

            await sleep(resetTime);

            return rateLimitedFetch(url, timeToWait, body);
        }

        if (!response.ok) {
            console.error('Something went wrong with the request.', {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText,
                url: response.url
            });

            return null;
        }

        const remaining =
            Number(response.headers.get('x-ratelimit-remaining')?.split(',')[0]);

        const resetTime =
            Number(response.headers.get('x-ratelimit-reset')?.split(',')[0]) * 1000 + 100;

        timeToWait[0] = remaining === 1
            ? resetTime
            : 0;

        return response;
    }


    // get badges

    let requestsProcessed = 0;
    const badgeRateLimit = [0];

    let nextCursor = '';

    do {
        const response = await rateLimitedFetch(
            `https://roblox-badge-api.bqbo.workers.dev/v1/universes/2380077519/badges?limit=100&cursor=${nextCursor}`,
            badgeRateLimit
        );

        if (!response) break;

        const data = await response.json();

        nextCursor = data.nextPageCursor;
        gloveData.push(...data.data);

        requestsProcessed++;

    } while (nextCursor);

    // progbar

    const inventoryRequestCount = Math.ceil(gloveData.length / 100);
    const thumbnailRequestCount = Math.ceil(gloveData.length / 20);

    const totalRequestsToProcess =
        requestsProcessed +
        inventoryRequestCount +
        thumbnailRequestCount;

    const progressBar = $('#pc-bar-1')[0];

    let requestsOngoing = true;

    const progressLoop = (async () => {
        while (requestsOngoing) {
            const percent = Math.round(
                (requestsProcessed / totalRequestsToProcess) * 100
            );

            progressBar.innerText = `${percent}%`;

            progressBar.animate(
                [
                    {
                        width: progressBar.style.width
                    },
                    {
                        width: `${percent}%`
                    }
                ],
                {
                    duration: 1000,
                    easing: 'ease-in-out',
                    fill: 'forwards'
                }
            );

            await sleep(100);
        }

        progressBar.innerText = '100%';
    })();

    // check owned badges

    const inventoryRateLimit = [0];

    for (let i = 0; i < gloveData.length; i += 100) {
        const badgeIds = gloveData
            .slice(i, i + 100)
            .map(glove => glove.id);

        const response = await rateLimitedFetch(
            `https://roblox-cloud-api.bqbo.workers.dev/users/${userId}/inventory-items?maxPageSize=100&filter=badgeIds=${badgeIds.join(',')}`,
            inventoryRateLimit
        );

        if (!response) break;

        const owned = await response.json();

        inventoryData.push(...owned.inventoryItems);

        requestsProcessed++;
    }

    // fetch thumbnails

    const thumbnailRateLimit = [0];
    const thumbnailRequests = [];

    for (let i = 0; i < gloveData.length; i += 20) {
        const thumbnailRequestBody = gloveData
            .slice(i, i + 20)
            .map(glove => ({
                requestId: crypto.randomUUID(),
                targetId: glove.id,
                type: 'BadgeIcon',
                size: '150x150',
                isCircular: true
            }));

        thumbnailRequests.push(
            rateLimitedFetch(
                'https://roblox-thumbnail-api.bqbo.workers.dev/v1/batch',
                thumbnailRateLimit,
                JSON.stringify(thumbnailRequestBody)
            )
        );
        requestsProcessed++;
    }

    const thumbnailResponses = await Promise.all(thumbnailRequests);

    for (const response of thumbnailResponses) {
        if (!response) continue;

        const data = await response.json();

        thumbnailData.push(...data.data);
    }

    // cleanup

    requestsOngoing = false;

    await progressLoop;

    let playerRateLimit = [0];
    const playerResponse = await rateLimitedFetch(`https://roblox-cloud-api.bqbo.workers.dev/users/${userId}`, playerRateLimit);
    playerData = await playerResponse.json();

    $('#abt1-img')[0].src = $('.uspdp')[0].src;
    $('#apd1-displayname')[0].innerText = playerData.displayName;
    $('#apd1-username')[0].innerText = `(@${playerData.name})`;
    $('#apd1-joindate')[0].innerText = new Date(playerData.createTime).toLocaleString();
    $('#upc-about')[0].style.display = 'flex';

    for (badge of gloveData) {
        const badgeItem = document.createElement('div');
        badgeItem.className = 'badge-item';
        const badgeItemIn = document.createElement('div');
        badgeItemIn.className = 'badge-item-in';
        const badgeImage = document.createElement('div');
        badgeImage.className = 'badge-image';
        const badgeImageI = document.createElement('img');
        badgeImageI.className = 'badge-image-i';
        const badgeDetails = document.createElement('div');
        badgeDetails.className = 'badge-details';
        const badgeName = document.createElement('span');
        badgeName.className = 'fredoka badge-name';
        const badgeObtainedDate = document.createElement('span');
        badgeObtainedDate.className = 'fredoka badge-obtained-date';
        badgeImageI.src = thumbnailData.find(item => item.targetId == badge.id).imageUrl;
        badgeName.innerText = badge.name;
        if (inventoryData.find(item => item.badgeDetails.badgeId == badge.id) == null) {
            badgeItem.className = 'badge-item badge-unowned';
            badgeObtainedDate.innerText = 'Unowned'
        } else {
            badgeItem.className = 'badge-item badge-owned';
            badgeObtainedDate.innerText = new Date(inventoryData.find(item => item.badgeDetails.badgeId == badge.id).addTime).toLocaleString();
        }
        badgeDetails.append(badgeName);
        badgeDetails.append(document.createElement('br'));
        badgeDetails.append(badgeObtainedDate);
        badgeImage.append(badgeImageI);
        badgeItemIn.append(badgeImage);
        badgeItemIn.append(badgeDetails);
        badgeItem.append(badgeItemIn);
        $('#bg1')[0].append(badgeItem);
    }
});


onRequest