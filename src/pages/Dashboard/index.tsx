import React from 'react';
import { FiTrash2, FiPlus, FiFolderPlus, FiSliders } from 'react-icons/fi';
import { useTheme } from 'styled-components';
import TimerItem from '../../components/TimerItem';
import { Container, WorkspaceItem } from './styles';
import { useWorkspace } from '../../hooks/workspace';

const Dashboard: React.FC = () => {
  const { red, text } = useTheme();
  const { createNewTimerModal, workspaces, selectedWorkspace, createWorkspaceModal, setSelectedWorkspace, deleteWorkspace } = useWorkspace();

  return (
    <Container>
      <aside>
        <h1>Workspaces</h1>
        <ul>
          {workspaces.map((workspace) => (
            <WorkspaceItem key={workspace.id} onClick={() => setSelectedWorkspace(workspace)} isActive={Number((selectedWorkspace || { id: null }).id === workspace.id)}>
              {workspace.name}
              <FiTrash2 size={16} color={red} onClick={e => {
                e.stopPropagation();
                deleteWorkspace(workspace.id);
              }} />
            </WorkspaceItem>
          ))}
        </ul>

        <footer>
          <FiSliders size={20} color={text} />
          <FiFolderPlus onClick={createWorkspaceModal} size={20} color={text} />
        </footer>
      </aside>
      <main>
        {selectedWorkspace && (
          <>
            <h1>
              {selectedWorkspace.name}
              <button onClick={createNewTimerModal}>
                <FiPlus size={20} color={text} />
                New
              </button>
            </h1>
            <ul>
              {selectedWorkspace.timers.map(timer => (
                <TimerItem data={timer} key={timer.id} />
              ))}
            </ul>
          </>
        )}
      </main>
    </Container>
  );
}

export default Dashboard;