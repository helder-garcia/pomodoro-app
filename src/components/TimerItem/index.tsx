import { ipcRenderer } from 'electron';
import React, { useCallback, useMemo, useState } from 'react';
import { FiPlay, FiEdit, FiTrash } from 'react-icons/fi';
import { useTheme } from 'styled-components';
import { useWorkspace } from '../../hooks/workspace';
import Button from '../Button';

import { Container, ButtonsContainer } from './styles';

interface TimerItemProps {
    data: Timer;
}

const TimerItem: React.FC<TimerItemProps> = ({ data: { name, time, id } }) => {
    const { red, text } = useTheme();
    const { deleteTimer } = useWorkspace();

    const [editMode, setEditMode] = useState(false);

    const hours = useMemo(() => time ? Math.floor(time / 3600) : null, [time]);
    const minutes = useMemo(() => time ? Math.floor(time % 3600 / 60) : null, [time]);
    const seconds = useMemo(() => time ? Math.floor(time % 3600 % 60) : null, [time]);

    const stringHours = useMemo(() => String(hours).padStart(2, '0'), [hours]);
    const stringMinutes = useMemo(() => String(minutes).padStart(2, '0'), [minutes]);
    const stringSeconds = useMemo(() => String(seconds).padStart(2, '0'), [seconds]);

    const openTimer = useCallback(() => {
        ipcRenderer.send('create-timer-window', {
            time,
            name
        });
    }, [time, name]);

    const handleDeleteTimer = useCallback(() => deleteTimer(id), [id]);

    const toggleEditMode = useCallback(() => setEditMode(prev => !prev), []);

    return (
        <Container>
            <h2>{!!hours && <>{stringHours}<span>:</span></>}{stringMinutes}<span>:</span>{stringSeconds}</h2>
            <h3>{name}</h3>
            {!editMode && (
                <footer>
                    <FiPlay onClick={openTimer} size={20} color={text} />
                    <FiEdit size={20} color={text} onClick={toggleEditMode} />
                    <FiTrash size={20} color={red} onClick={handleDeleteTimer} />
                </footer>
            )}
            {editMode && (
                <ButtonsContainer>
                    <Button onClick={toggleEditMode}>Cancel</Button>
                    <Button confirmButton>Confirm</Button>
                </ButtonsContainer>
            )}
        </Container>
    );
}

export default TimerItem;