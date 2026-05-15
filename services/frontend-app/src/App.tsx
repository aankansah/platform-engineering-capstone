import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { AppSidebar } from './components/AppSidebar'
import { ProjectInfoFab } from './components/ProjectInfoFab'
import { ProjectInfoModal } from './components/ProjectInfoModal'
import { TaskForm } from './components/TaskForm'
import { Timeline } from './components/Timeline'
import { WelcomeAlert } from './components/WelcomeAlert'
import { useTaskDashboard } from './hooks/useTaskDashboard'

function App() {
  const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false)
  const {
    eventsError,
    isSubmitting,
    lastUpdated,
    setTask,
    submitMessage,
    submitTask,
    task,
    taskEvents,
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

        <section className="min-h-0 overflow-y-auto px-8 pt-10 pb-8">
          <div className="flex min-h-full flex-col gap-6">
            <WelcomeAlert />
            <Timeline
              events={taskEvents}
              eventsError={eventsError}
              lastUpdated={lastUpdated}
            />
          </div>
        </section>
      </div>

      <ProjectInfoFab onClick={() => setIsProjectInfoOpen(true)} />
      <ProjectInfoModal
        isOpen={isProjectInfoOpen}
        onClose={() => setIsProjectInfoOpen(false)}
      />
    </main>
  )
}

export default App
