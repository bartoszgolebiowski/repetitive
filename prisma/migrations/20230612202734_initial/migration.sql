-- CreateEnum
CREATE TYPE "Status" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'DELAYED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "LinePlan" (
    "id" STRING NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" STRING NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" STRING NOT NULL,
    "organizationId" STRING NOT NULL,
    "productionLine" STRING NOT NULL,
    "assignedTo" STRING NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL,
    "comment" STRING NOT NULL,

    CONSTRAINT "LinePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionPlan" (
    "id" STRING NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" STRING NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" STRING NOT NULL,
    "status" "Status" NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING NOT NULL,
    "assignedTo" STRING NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "linePlanId" STRING NOT NULL,

    CONSTRAINT "ActionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" STRING NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" STRING NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" STRING NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "assignedTo" STRING NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "Status" NOT NULL,
    "leader" STRING NOT NULL,
    "actionPlanId" STRING NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" STRING NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" STRING NOT NULL,
    "comment" STRING NOT NULL,
    "actionId" STRING NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" STRING NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cause" STRING NOT NULL,
    "read" BOOL NOT NULL DEFAULT false,
    "email" STRING NOT NULL,
    "variables" STRING[],

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActionPlan" ADD CONSTRAINT "ActionPlan_linePlanId_fkey" FOREIGN KEY ("linePlanId") REFERENCES "LinePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_actionPlanId_fkey" FOREIGN KEY ("actionPlanId") REFERENCES "ActionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;
