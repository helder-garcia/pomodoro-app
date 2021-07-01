import { ipcMain } from "electron";
import { v4 } from "uuid";
import { idsTranslator } from "./main";
import { windowsStore, workspacesStore } from './stores';
import timer from "./timer";

interface ITimerProps {
    time: number;
    name?: string;
}

type Events = {
    [channel: string]: (event: Electron.IpcMainEvent, ...args: any[]) => void;
}

let getTimeCalledTimes = 0;

export default {
    'get-timer-props': (ev, id) => {
        const window = windowsStore.windows.filter(window => window.type === 'timer').find((win) => win.id === idsTranslator[id]);

        ev.returnValue = {
            storedTime: window?.time,
            storedMaxTime: window?.maxTime,
            name: window?.name
        }

        getTimeCalledTimes++;
        if (getTimeCalledTimes === windowsStore.windows.filter(window => window.type === 'timer').length) {
            ipcMain.emit('initial-windows-created');
        }
    },
    'create-timer-window': (_, { time, name }: ITimerProps) => {
        timer.create({
            time,
            name
        });
    },
    'delete-timer': (ev, id: string) => {
        const workspaceIndex = workspacesStore.findIndex(workspace => !!workspace.timers.find(timer => timer.id === id));
        const timers = workspacesStore[workspaceIndex].timers;

        timers.splice(timers.findIndex(timer => timer.id === id), 1);

        const updatedWorkspace = {
            ...workspacesStore[workspaceIndex],
            timers
        }

        workspacesStore[workspaceIndex] = updatedWorkspace;

        ev.returnValue = updatedWorkspace;
    },
    'create-timer': (ev, { time, name, workspaceId }: ITimerDTO) => {
        const workspaceIndex = workspacesStore.findIndex(workspace => workspace.id === workspaceId);

        const generatedTimer = {
            time,
            name,
            id: v4()
        }

        const originalTimers = workspacesStore[workspaceIndex].timers;

        const updatedWorkspace: Workspace = {
            ...workspacesStore[workspaceIndex],
            timers: [...originalTimers, generatedTimer]
        }

        workspacesStore[workspaceIndex] = updatedWorkspace;

        ev.returnValue = generatedTimer;
    },
    'create-workspace': (ev, workspaceDto: WorkspaceDTO) => {
        const workspace = {
            timers: [],
            ...workspaceDto,
            id: v4()
        } as Workspace;

        workspacesStore.push(workspace);

        ev.returnValue = workspace;
    },
    'get-workspaces': (ev) => {
        ev.returnValue = JSON.parse(JSON.stringify(workspacesStore));
    },
    'delete-workspace': (ev, id: string) => {
        const workspaceIndex = workspacesStore.findIndex(workspace => workspace.id === id);
        workspacesStore.splice(workspaceIndex, 1);
        ev.returnValue = JSON.parse(JSON.stringify(workspacesStore));
    },
    'edit-workspace': (ev, id: string, data: Partial<WorkspaceDTO>) => {
        const workspaceIndex = workspacesStore.findIndex(workspace => workspace.id === id);

        const finalWorkspace = {
            ...workspacesStore[workspaceIndex],
            ...data
        };

        workspacesStore[workspaceIndex] = finalWorkspace;

        ev.returnValue = JSON.parse(JSON.stringify(workspacesStore));
    },
    'edit-timer': (ev, id: string, data: Partial<Timer>) => {
        const workspaceIndex = workspacesStore.findIndex(workspace => !!workspace.timers.find(timer => timer.id === id));

        const oldTimerIndex = workspacesStore[workspaceIndex].timers.findIndex(timer => timer.id === id);

        const updatedTimers = workspacesStore[workspaceIndex].timers;

        updatedTimers[oldTimerIndex] = {
            ...workspacesStore[workspaceIndex].timers[oldTimerIndex],
            ...data,
        }

        const updatedWorkspace: Workspace = {
            ...workspacesStore[workspaceIndex],
            timers: updatedTimers
        }

        workspacesStore[workspaceIndex] = updatedWorkspace;
        ev.returnValue = JSON.parse(JSON.stringify(workspacesStore));
    }
} as Events;