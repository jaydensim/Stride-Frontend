import SimpleMenu from "../ui/components/simplemenu/simplemenu";
import uiIcons from "../ui/theme/icons";
import intl from "../intl/intl";
import SimpleDialog from "../ui/components/simpledialog/simpledialog";
import SharedHomeUI from "../ui/components/sharedHomeUI.js/sharedHomeUI";
import { io } from "socket.io-client";

let loaderHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="uie-circleLoader"><circle cx="50" cy="50" r="45"></circle></svg>`

class SharedStateModule {
    sharedStatus = 0;
    serverURL = ''
    socketInstance = null;
    currentUsers = [];
    shareDialogLink = '';
    shareLink = '';
    latencyMeasurements = [];
    latency = 0;
    timeout = false;
    constructor(url) {
        window.addEventListener('SystemStateEvent-CollaborationModule-ManagePeopleButton', (e) => {
            //console.log(e)
            switch (this.sharedStatus) {
                case 0: {
                    new SimpleMenu(window.uiDocument, [e.detail.clientX, e.detail.clientY, 2], [
                        {
                            type: 'menuElement',
                            icon: 'ui/sharescreen',
                            onSelected: () => {
                                this.#beginSharing();
                            },
                            name: intl.str('app.sharemodule.beginsharing')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/person',
                            onSelected: () => {
                                this.#editProfile();
                            },
                            name: intl.str('app.sharemodule.editProfile')
                        }
                    ]);
                    break;
                }
                case 1: {
                    let menuArr = [
                        {
                            type: 'menuElement',
                            icon: 'ui/sharescreen',
                            onSelected: () => {
                                //console.log('end')
                            },
                            name: intl.str('app.sharemodule.endsharing')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/link',
                            onSelected: () => {
                                let dialog = new SimpleDialog(window.uiDocument, {
                                    title: intl.str('app.sharemodule.beginsharing'),
                                    icon: uiIcons.ui.sharescreen,
                                    canClose: false,
                                    largeDialog: false,
                                    body: '<div class="shareDialogReplace" uie-ref="shareDialogReplace"></div>',
                                    buttons: [{
                                        type: 'primary',
                                        text: intl.str('app.ui.loadingAction'),
                                        callback: (e) => { },
                                        close: true
                                    }],
                                });
                                document.querySelector('[uie-ref="shareDialogReplace"]').innerHTML = this.shareDialogLink
                                document.querySelector('main.uie-dialog .uie-simpledialog-button').innerText = intl.str('app.ui.closeAction');
                                document.querySelector('main.uie-dialog .uie-simpledialog-button').disabled = false;
                                document.querySelector('[uie-ref="shareDialogReplace"] code').addEventListener('click', () => {
                                    navigator.clipboard.writeText(this.shareLink)
                                });
                            },
                            name: intl.str('app.sharemodule.copyLink')
                        },
                        {
                            type: 'seperator',
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/editSettings',
                            onSelected: () => {
                                this.#editProfile();
                            },
                            name: window.ProfileState.userProfile.name,
                            hoverName: intl.str('app.sharemodule.editProfile')
                        }
                    ];
                    if (window.sharedState.currentUsers.length > 1) {
                        menuArr.push(
                            {
                                type: 'seperator',
                            })
                    }
                    window.sharedState.currentUsers.forEach(user => {
                        if (user.id !== window.ProfileState.userProfile.id) {
                            menuArr.push({
                                type: 'menuElement',
                                icon: 'ui/person',
                                onSelected: () => {
                                    //console.log(user)
                                },
                                name: user.name
                            })
                        }
                    })
                    menuArr.push({
                        type: 'seperator',
                    })
                    if (window.sharedState.currentUsers.length > 1) {
                        menuArr.push({
                            type: 'menuElement',
                            icon: 'blank/blank',
                            onSelected: () => { },
                            name: (window.sharedState.currentUsers.length - 1) + ' people connected'
                        })
                    } else {
                        menuArr.push({
                            type: 'menuElement',
                            icon: 'blank/blank',
                            onSelected: () => { },
                            name: window.sharedState.currentUsers.length + ' person connected (That\'s you!)'
                        })
                    }
                    new SimpleMenu(window.uiDocument, [e.detail.clientX, e.detail.clientY, 2], menuArr);
                    break;
                }
                case 2: {
                    let menuArr = [
                        {
                            type: 'menuElement',
                            icon: 'ui/link',
                            onSelected: () => {
                                let dialog = new SimpleDialog(window.uiDocument, {
                                    title: intl.str('app.sharemodule.beginsharing'),
                                    icon: uiIcons.ui.sharescreen,
                                    canClose: false,
                                    largeDialog: false,
                                    body: '<div class="shareDialogReplace" uie-ref="shareDialogReplace"></div>',
                                    buttons: [{
                                        type: 'primary',
                                        text: intl.str('app.ui.loadingAction'),
                                        callback: (e) => { },
                                        close: true
                                    }],
                                });
                                this.shareDialogLink = '<h1>' + intl.str('app.sharemodule.copyLinkTitle') + '</h1><code>' + window.prevURL || '' + '</code><p>' + intl.str('app.sharemodule.copyLinkBody') + '</p>';
                                document.querySelector('[uie-ref="shareDialogReplace"]').innerHTML = this.shareDialogLink
                                document.querySelector('main.uie-dialog .uie-simpledialog-button').innerText = intl.str('app.ui.closeAction');
                                document.querySelector('main.uie-dialog .uie-simpledialog-button').disabled = false;
                                document.querySelector('[uie-ref="shareDialogReplace"] code').addEventListener('click', () => {
                                    navigator.clipboard.writeText(window.prevURL)
                                });
                            },
                            name: intl.str('app.sharemodule.copyLink')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/editSettings',
                            onSelected: () => {
                                this.#editProfile();
                            },
                            name: window.ProfileState.userProfile.name,
                            hoverName: intl.str('app.sharemodule.editProfile')
                        }
                    ];
                    if (window.sharedState.currentUsers.length > 1) {
                        menuArr.push(
                            {
                                type: 'seperator',
                            })
                    }
                    window.sharedState.currentUsers.forEach(user => {
                        if (user.id !== window.ProfileState.userProfile.id) {
                            menuArr.push({
                                type: 'menuElement',
                                icon: 'ui/person',
                                onSelected: () => {
                                    //console.log(user)
                                },
                                name: user.name
                            })
                        }
                    })
                    menuArr.push({
                        type: 'seperator',
                    })
                    if (window.sharedState.currentUsers.length > 1) {
                        menuArr.push({
                            type: 'menuElement',
                            icon: 'blank/blank',
                            onSelected: () => { },
                            name: (window.sharedState.currentUsers.length - 1) + ' people connected'
                        })
                    } else {
                        menuArr.push({
                            type: 'menuElement',
                            icon: 'blank/blank',
                            onSelected: () => { },
                            name: (window.sharedState.currentUsers.length - 1) + ' people connected (Feeling lonely yet?)'
                        })
                    }
                    new SimpleMenu(window.uiDocument, [e.detail.clientX, e.detail.clientY, 2], menuArr);
                    break;
                }
            }
        });
        window.addEventListener('SystemStateEvent-CollaborationModule-ManageCloudButton', (e) => {
            //console.log(e.detail)
            if (this.sharedStatus == 0) {
                new SimpleMenu(window.uiDocument, [e.detail.clientX, e.detail.clientY, 2], [{
                    type: 'menuElement',
                    icon: 'ui/circleDismiss',
                    onSelected: () => { },
                    name: intl.str('app.signalbars.cloudDisconnected')
                },
                {
                    type: 'menuElement',
                    icon: '_7th_Signal_Regiment/off',
                    onSelected: () => { },
                    name: intl.str('app.signalbars.signalDisconnected')
                }]);
            } else {
                let menuEls = [];
                if (window.sharedState.socketInstance.connected) {
                    menuEls.push({
                        type: 'menuElement',
                        icon: 'ui/check',
                        onSelected: () => { },
                        name: intl.str('app.signalbars.cloudConnected')
                    })
                } else {
                    menuEls.push({
                        type: 'menuElement',
                        icon: 'ui/circleDismiss',
                        onSelected: () => { },
                        name: intl.str('app.signalbars.cloudConnecting')
                    })
                }
                if (window.sharedState.timeout == false) {
                    if (window.sharedState.latency <= 2) {
                        menuEls.push({
                            type: 'menuElement',
                            icon: '_7th_Signal_Regiment/error',
                            onSelected: () => { },
                            name: intl.str('app.signalbars.signalLatencyWaiting')
                        })
                    } else if (window.sharedState.latency < 200) {
                        menuEls.push({
                            type: 'menuElement',
                            icon: '_7th_Signal_Regiment/signal_5',
                            onSelected: () => { },
                            name: intl.str('app.signalbars.signalConnected') + window.sharedState.latency + intl.str('app.signalbars.signalMSUnits')
                        })
                    } else if (window.sharedState.latency < 300) {
                        menuEls.push({
                            type: 'menuElement',
                            icon: '_7th_Signal_Regiment/signal_4',
                            onSelected: () => { },
                            name: intl.str('app.signalbars.signalConnected') + window.sharedState.latency + intl.str('app.signalbars.signalMSUnits')
                        })
                    } else if (window.sharedState.latency < 400) {
                        menuEls.push({
                            type: 'menuElement',
                            icon: '_7th_Signal_Regiment/signal_3',
                            onSelected: () => { },
                            name: intl.str('app.signalbars.signalConnected') + window.sharedState.latency + intl.str('app.signalbars.signalMSUnits')
                        })
                    } else if (window.sharedState.latency < 500) {
                        menuEls.push({
                            type: 'menuElement',
                            icon: '_7th_Signal_Regiment/signal_2',
                            onSelected: () => { },
                            name: intl.str('app.signalbars.signalConnected') + window.sharedState.latency + intl.str('app.signalbars.signalMSUnits')
                        })
                    } else {
                        menuEls.push({
                            type: 'menuElement',
                            icon: '_7th_Signal_Regiment/signal_1',
                            onSelected: () => { },
                            name: intl.str('app.signalbars.signalConnected') + window.sharedState.latency + intl.str('app.signalbars.signalMSUnits')
                        })
                    }
                } else {
                    menuEls.push({
                        type: 'menuElement',
                        icon: '_7th_Signal_Regiment/error',
                        onSelected: () => { },
                        name: intl.str('app.signalbars.signalLatencyError')
                    })
                }
                new SimpleMenu(window.uiDocument, [e.detail.clientX, e.detail.clientY, 2], menuEls);
            }
        });
        if (url) {
            //console.log(url.split('+'))
            this.#joinDocument(url.split('+'))
        }
    }
    #socketTools = {
        getApiStatus(callback, serverURL) {
            this.serverURL = serverURL || window.SettingsStateModule["collaboration.server.defaultServerURL"];
            if (this.serverURL.substring(0, this.serverURL.length - 1) == '/') {
                this.serverURL = this.serverURL.substring(0, this.serverURL.length - 1);
            }
            window.fetch(this.serverURL + '/info')
                .then(
                    function (response) {
                        switch (response.status) {
                            case 200:
                                response.json().then(function (data) {
                                    callback({
                                        code: response.status,
                                        data: data
                                    })
                                });
                                break;
                            default:
                                //console.log('Looks like there was a problem. Status Code: ' + response.status)
                                callback({
                                    code: response.status,
                                })
                                break;
                        }
                    }
                )
                .catch(function (err) {
                    callback({
                        code: 0,
                        err: err
                    })
                });
        },
        getRandomEmoji(screen) {
            let intervalCount = 0;
            let interval = setInterval(() => {
                intervalCount++;
                if (intervalCount <= 59) {
                    let profile = ProfileState.generateRandomUserProfile();
                    document.querySelector('section.' + screen + 'Profile section.userprofile-header>.emojicont').innerText = profile[1];
                    document.querySelector('section.' + screen + 'Profile section.userprofile-header>.emojicont').style.backgroundColor = profile[2];
                    document.querySelector('section.' + screen + 'Profile section.userprofile-header>input').value = profile[0];
                } else {
                    clearInterval(interval);
                }
            }, 25);
        },
        connectToSocket(addr, id, callback) {
            window.uiDocument.components.menubar.updateItem('sys-cloud', uiIcons.cloud.sync);
            try {
                let urlstr = new URL(this.serverURL);
                urlstr.pathname = '';
                //console.log(urlstr.toString(), addr)
                window.sharedState.socketInstance = io(urlstr.toString() + "document-" + id, {
                    path: addr,
                    query: {
                        userprofile: JSON.stringify(window.ProfileState.userProfile)
                    }
                });
                window.sharedState.socketInstance.on("connect", () => {
                    //console.log('e')
                    window.uiDocument.components.menubar.updateItem('sys-cloud', uiIcons.cloud.success);
                    window.sharedState.socketInstance.io.engine.once("upgrade", () => {
                        window.uiDocument.components.menubar.updateItem('sys-cloud', uiIcons.cloud.success);
                    });
                    window.sharedState.socketInstance.io.engine.on("packet", ({ type, data }) => {
                        window.uiDocument.components.menubar.updateItem('sys-cloud', uiIcons.cloud.download);
                    });
                    window.sharedState.socketInstance.io.engine.on("packetCreate", ({ type, data }) => {
                        window.uiDocument.components.menubar.updateItem('sys-cloud', uiIcons.cloud.upload);
                    });
                });
                window.sharedState.socketInstance.io.on("error", (error) => {
                    window.uiDocument.components.menubar.updateItem('sys-cloud', uiIcons.cloud.fail);
                });
                window.sharedState.socketInstance.io.on("reconnect", (attempt) => {
                    window.uiDocument.components.menubar.updateItem('sys-cloud', uiIcons.cloud.success);
                });
                window.sharedState.socketInstance.io.on("reconnect_attempt", (attempt) => {
                    window.uiDocument.components.menubar.updateItem('sys-cloud', uiIcons.cloud.sync);
                });
                window.sharedState.socketInstance.io.on("reconnect_error", (error) => {
                    window.uiDocument.components.menubar.updateItem('sys-cloud', uiIcons.cloud.fail);
                });
                window.sharedState.socketInstance.io.on("ping", () => {
                    window.uiDocument.components.menubar.updateItem('sys-cloud', uiIcons.cloud.success);
                });
                window.sharedState.socketInstance.on("SharedStateRelay-DSMG-ioComm", (name, args) => {
                    //console.log('socket recieved can', name, args)
                    window.dispatchEvent(new CustomEvent(name, { detail: args }))
                });
                window.addEventListener('SharedStateRelay-DSMG-ioComm', (e) => {
                    //console.log('socket emit', e.detail)
                    window.sharedState.socketInstance.emit('SharedStateRelay-DSMG-ioComm', e.detail.name, e.detail.args);
                });
                window.sharedState.socketInstance.on('SharedStateRelay-DSMG-ioConnectivity-NewUser', (userProfile) => {
                    //console.log('socket newUser', userProfile, window.sharedState.currentUsers);
                    window.sharedState.currentUsers.push(userProfile);
                    window.sharedState.socketInstance.emit('SharedStateRelay-DSMG-ioDocumentStateUpdate', window.OTDocument_Export());
                    if (userProfile.id !== window.ProfileState.userProfile.id) {
                        window.dispatchEvent(new CustomEvent('SharedStateRelay-UserListUpdate-New', { detail: { userProfile: userProfile } }));
                    }
                });
                window.sharedState.socketInstance.on('SharedStateRelay-DSMG-ioConnectivity-RemoveUser', (userProfile, intl) => {
                    //console.log('socket newUser', userProfile, window.sharedState.currentUsers);
                    if (userProfile.id !== window.ProfileState.userProfile.id) {
                        window.dispatchEvent(new CustomEvent('SharedStateRelay-UserListUpdate-RemoveUser', { detail: { userProfile: userProfile } }));
                        window.sharedState.currentUsers = intl.currentUsers;
                    }
                });
                window.sharedState.socketInstance.on('SharedStateRelay-DSMG-ioDocumentStateUpdateGet', () => {
                    window.sharedState.socketInstance.emit('SharedStateRelay-DSMG-ioDocumentStateUpdate', window.OTDocument_Export());
                })

                window.sharedState.socketInstance.once("SharedStateRelay-DSMG-ioDocumentStateUpdate", (documentState) => {
                    //console.log(documentState);
                    //if (window.SettingsStateModule['flags.acceptDSUpdatesWhenJoined'] == true) {
                    window.OTDocument_Import(documentState);
                    //}
                });

                setInterval(() => {
                    let time1 = performance.now();
                    window.sharedState.socketInstance.volatile.emit('SharedStateRelay-DSMG-ioLatencyCheck', socketCBTimeout(() => {
                        let totalTime = performance.now() - time1;
                        window.sharedState.timeout = false;
                        if (window.sharedState.latencyMeasurements.length >= 100) window.sharedState.latencyMeasurements.shift();
                        window.sharedState.latencyMeasurements.push(totalTime);
                        window.sharedState.latency = Math.round(((window.sharedState.latencyMeasurements.reduce((sum, i) => sum + i, 0) / window.sharedState.latencyMeasurements.length) + Number.EPSILON) * 100) / 100;
                    }, () => {
                        window.sharedState.timeout = true;
                    }, 4500));
                }, 5000);
                callback(200);
            } catch (err) {
                callback(0, err);
            }
        }
    }
    #editProfile() {
        let sharedHUI = new SharedHomeUI(window.uiDocument);
        setTimeout(() => {
            sharedHUI.setScreen(2);
            if (window.ProfileState.userProfile.name !== '') {
                document.querySelector('section.editProfile section.userprofile-header>.emojicont').innerText = window.ProfileState.userProfile.emoji;
                document.querySelector('section.editProfile section.userprofile-header>.emojicont').style.backgroundColor = window.ProfileState.userProfile.color;
                document.querySelector('section.editProfile section.userprofile-header>input').value = window.ProfileState.userProfile.name;
            } else {
                this.#socketTools.getRandomEmoji('edit');
            }
            document.querySelector('section.editProfile section.userprofile-header>.emojicont').addEventListener('click', () => {
                this.#socketTools.getRandomEmoji('edit')
            });
            document.querySelector('section.editProfile section.userprofile-header>button').addEventListener('click', () => {
                window.ProfileState.updateUserProfile(document.querySelector('section.editProfile section.userprofile-header>input').value, document.querySelector('section.editProfile section.userprofile-header>.emojicont').innerText, document.querySelector('section.editProfile section.userprofile-header>.emojicont').style.backgroundColor);
                sharedHUI.setScreen(0);
                setTimeout(() => {
                    sharedHUI.destroy();
                }, 1000);
            });
        }, 1500);
    }
    #beginSharing() {
        let dialog = new SimpleDialog(window.uiDocument, {
            title: intl.str('app.sharemodule.beginsharing'),
            icon: uiIcons.ui.sharescreen,
            canClose: false,
            largeDialog: false,
            body: '<div class="shareDialogReplace" uie-ref="shareDialogReplace"></div>',
            buttons: [{
                type: 'primary',
                text: intl.str('app.ui.loadingAction'),
                callback: (e) => { },
                close: true
            }],
        });
        document.querySelector('main.uie-dialog .uie-simpledialog-button').disabled = true;
        document.querySelector('[uie-ref="shareDialogReplace"]').innerHTML = loaderHTML;
        setTimeout(() => {
            this.#socketTools.getApiStatus((status) => {
                if (status.code == 200) {
                    let sharedHUI = new SharedHomeUI(window.uiDocument);
                    setTimeout(() => {
                        sharedHUI.setScreen(1);
                        document.querySelector('main.uie-shui.uie-outer section.setProfile>section p span').innerHTML = window.DocumentState.name;
                        if (window.ProfileState.userProfile.name !== '') {
                            document.querySelector('section.setProfile section.userprofile-header>.emojicont').innerText = window.ProfileState.userProfile.emoji;
                            document.querySelector('section.setProfile section.userprofile-header>.emojicont').style.backgroundColor = window.ProfileState.userProfile.color;
                            document.querySelector('section.setProfile section.userprofile-header>input').value = window.ProfileState.userProfile.name;
                        } else {
                            this.#socketTools.getRandomEmoji('set');
                        }
                        document.querySelector('section.setProfile section.userprofile-header>.emojicont').addEventListener('click', () => {
                            this.#socketTools.getRandomEmoji('set')
                        });
                        document.querySelector('section.setProfile section.userprofile-header>button').addEventListener('click', () => {
                            sharedHUI.setScreen(0);
                            window.ProfileState.updateUserProfile(document.querySelector('section.setProfile section.userprofile-header>input').value, document.querySelector('section.setProfile section.userprofile-header>.emojicont').innerText, document.querySelector('section.setProfile section.userprofile-header>.emojicont').style.backgroundColor);
                            this.#socketTools.connectToSocket(status.data.socketAddr, window.DocumentState.id, () => {
                                //console.log(this.socketInstance)
                                this.socketInstance.emit("SharedStateRelay-DSMG-ioConnectivityCheck", () => {
                                    const url = new URL(window.location.href);
                                    url.hash = window.btoa(window.DocumentState.id + '+' + window.SettingsStateModule["collaboration.server.defaultServerURL"]);
                                    //console.log(url.toString()); // ok
                                    this.sharedStatus = 1;
                                    this.shareLink = url.toString();
                                    this.shareDialogLink = '<h1>' + intl.str('app.sharemodule.copyLinkTitle') + '</h1><code>' + url.toString() + '</code><p>' + intl.str('app.sharemodule.copyLinkBody') + '</p>';
                                    document.querySelector('[uie-ref="shareDialogReplace"]').innerHTML = this.shareDialogLink
                                    document.querySelector('main.uie-dialog .uie-simpledialog-button').innerText = intl.str('app.ui.closeAction');
                                    document.querySelector('main.uie-dialog .uie-simpledialog-button').disabled = false;
                                    document.querySelector('[uie-ref="shareDialogReplace"] code').addEventListener('click', () => {
                                        navigator.clipboard.writeText(url.toString())
                                    });
                                    sharedHUI.destroy();
                                });
                            })
                        });
                    }, 1500);
                } else if (status.code == 404) {
                    document.querySelector('[uie-ref="shareDialogReplace"]').innerHTML = 'There was an error'
                }
            });
        }, 1000)
    }

    #joinDocument(id) {
        let sharedHUI = new SharedHomeUI(window.uiDocument);
        this.#socketTools.getApiStatus((status) => {
            if (status.code == 200) {
                window.DocumentState.name = "Unknown Document";
                sharedHUI.setScreen(3);
                document.querySelector('main.uie-shui.uie-outer section.joinProfile h1').innerHTML = window.DocumentState.name;
                if (window.ProfileState.userProfile.name !== '') {
                    document.querySelector('section.joinProfile section.userprofile-header>.emojicont').innerText = window.ProfileState.userProfile.emoji;
                    document.querySelector('section.joinProfile section.userprofile-header>.emojicont').style.backgroundColor = window.ProfileState.userProfile.color;
                    document.querySelector('section.joinProfile section.userprofile-header>input').value = window.ProfileState.userProfile.name;
                } else {
                    this.#socketTools.getRandomEmoji('join');
                }
                document.querySelector('section.joinProfile section.userprofile-header>.emojicont').addEventListener('click', () => {
                    this.#socketTools.getRandomEmoji('join')
                });
                document.querySelector('section.joinProfile section.userprofile-header>button').addEventListener('click', () => {
                    sharedHUI.setScreen(0);
                    window.ProfileState.updateUserProfile(document.querySelector('section.joinProfile section.userprofile-header>input').value, document.querySelector('section.joinProfile section.userprofile-header>.emojicont').innerText, document.querySelector('section.joinProfile section.userprofile-header>.emojicont').style.backgroundColor);
                    this.#socketTools.connectToSocket(status.data.socketAddr, id[0], () => {
                        //console.log(this.socketInstance)
                        this.socketInstance.once("SharedStateRelay-DSMG-ioDocumentStateUpdate", (documentState) => {
                            //console.log(documentState);
                            window.OTDocument_Import(documentState);
                        });
                        this.socketInstance.emit("SharedStateRelay-DSMG-ioConnectivityCheck", (intl) => {
                            /*intl = {
                                currentUsers: [{
                                    userProfile
                                }],
                                documentState: 
                            }
                            */
                            this.currentUsers = intl.currentUsers;
                            this.currentUsers.forEach(user => {
                                if (user.id !== window.ProfileState.userProfile.id) {
                                    window.dispatchEvent(new CustomEvent('SharedStateRelay-UserListUpdate-New', { detail: { userProfile: user } }));
                                }
                            });
                            //console.log(this.currentUsers)
                            this.sharedStatus = 2
                            sharedHUI.destroy();
                        });
                    })
                });

            }
        }, id[1]);
    }
}

function socketCBTimeout(success, timeout, delay) {
    let resolved = false;
    const resolveTimer = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        timeout();
    }, delay);
    return (...args) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(resolveTimer);
        success.apply(this, args);
    }
}
export default SharedStateModule;