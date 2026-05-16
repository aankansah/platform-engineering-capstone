import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { AppSidebar } from './components/AppSidebar'
import { EventDetailsModal } from './components/EventDetails'
import { ProjectInfoFab } from './components/ProjectInfoFab'
import { ProjectInfoModal } from './components/ProjectInfoModal'
import { TaskForm } from './components/TaskForm'
import { TaskHistory } from './components/TaskHistory'
import { Timeline } from './components/Timeline'
import { useTaskDashboard } from './hooks/useTaskDashboard'

function App() {
  const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false)
  const {
    eventsError,
    isSubmitting,
    lastUpdated,
    events,
    selectedEvent,
    setSelectedEventId,
    setTask,
    submitMessage,
    submitTask,
    task,
    tasks,
  } = useTaskDashboard()

  return (
    <main className="grid h-screen grid-rows-[auto_1fr] overflow-hidden bg-[linear-gradient(135deg,#6ebbd2_0%,#8aa8da_42%,#b9b7e8_72%,#d4b8f0_100%)] text-slate-950">
      <AppHeader eventsError={eventsError} />

      <div className="relative grid min-h-0 grid-cols-1 lg:grid-cols-[390px_1fr]">
        <AppSidebar>
          <TaskForm
            isSubmitting={isSubmitting}
            onSubmit={submitTask}
            setTask={setTask}
            submitMessage={submitMessage}
            task={task}
          />
        </AppSidebar>

        <section className="min-h-0 overflow-hidden px-6 pt-6 pb-6">
          <div className="grid h-full min-h-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
            <TaskHistory tasks={tasks} />
            <Timeline
              events={events}
              eventsError={eventsError}
              lastUpdated={lastUpdated}
              onSelectEvent={setSelectedEventId}
            />
          </div>
        </section>
      </div>

      <ProjectInfoFab onClick={() => setIsProjectInfoOpen(true)} />
      <ProjectInfoModal
        isOpen={isProjectInfoOpen}
        onClose={() => setIsProjectInfoOpen(false)}
      />
      <EventDetailsModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEventId('')}
      />
    </main>
  )
}

export default App
