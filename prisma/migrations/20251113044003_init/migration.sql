CREATE EXTENSION postgis;

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "geom" geometry(Point,4326) NOT NULL,
    "zip" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyCode" (
    "id" SERIAL NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "currencySymbol" TEXT NOT NULL,

    CONSTRAINT "CurrencyCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeZone" (
    "id" SERIAL NOT NULL,
    "zoneName" TEXT NOT NULL,
    "gmtOffset" INTEGER NOT NULL,
    "gmtOffsetName" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "tzName" TEXT NOT NULL,

    CONSTRAINT "TimeZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "country" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,
    "currencyCodeId" INTEGER NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "state" TEXT NOT NULL,
    "iso2" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "geom" geometry(Point,4326) NOT NULL,
    "countryId" INTEGER NOT NULL,
    "stateId" INTEGER,
    "timeZoneId" INTEGER NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCategory" (
    "id" SERIAL NOT NULL,
    "eventCategory" TEXT NOT NULL,

    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventType" (
    "id" SERIAL NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventCategoryId" INTEGER,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "image" TEXT,
    "eventTypeId" INTEGER NOT NULL,
    "ageRestriction" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionCategory" (
    "id" SERIAL NOT NULL,
    "promotionCategory" TEXT NOT NULL,

    CONSTRAINT "PromotionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionType" (
    "id" SERIAL NOT NULL,
    "promotionType" TEXT NOT NULL,
    "promotionCategoryId" INTEGER,

    CONSTRAINT "PromotionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "image" TEXT,
    "ageRestriction" INTEGER NOT NULL,
    "promotionTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueType" (
    "id" SERIAL NOT NULL,
    "venueType" TEXT NOT NULL,

    CONSTRAINT "VenueType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" SERIAL NOT NULL,
    "locationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "description" TEXT,
    "image" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "opensAt" DOUBLE PRECISION NOT NULL,
    "closesAt" DOUBLE PRECISION NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "ageRestriction" INTEGER NOT NULL,
    "isOutdoor" BOOLEAN NOT NULL,
    "isAccessible" BOOLEAN NOT NULL,
    "venueTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionFor" (
    "id" SERIAL NOT NULL,
    "permissionFor" TEXT NOT NULL,

    CONSTRAINT "PermissionFor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionType" (
    "id" SERIAL NOT NULL,
    "permissionType" TEXT NOT NULL,

    CONSTRAINT "PermissionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "permissionForId" INTEGER NOT NULL,
    "permissionTypeId" INTEGER NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationType" (
    "id" SERIAL NOT NULL,
    "notifcationType" TEXT NOT NULL,

    CONSTRAINT "NotificationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationFor" (
    "id" SERIAL NOT NULL,
    "notificationFor" TEXT NOT NULL,

    CONSTRAINT "NotificationFor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "notificationForId" INTEGER NOT NULL,
    "notificationTypeId" INTEGER NOT NULL,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedAccountType" (
    "id" SERIAL NOT NULL,
    "linkedAccountType" TEXT NOT NULL,

    CONSTRAINT "LinkedAccountType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedAccount" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "linkedAccountTypeId" INTEGER NOT NULL,
    "externalId" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentStatus" (
    "id" SERIAL NOT NULL,
    "paymentStatus" TEXT NOT NULL,

    CONSTRAINT "PaymentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER,
    "currencyCodeId" INTEGER NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "paymentMethodId" INTEGER NOT NULL,
    "paymentStatusId" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "userRole" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phoneNumber" TEXT,
    "name" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "profileImage" TEXT,
    "verified" BOOLEAN NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserEventPreferences" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserEventPreferences_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_VenueMusicType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_VenueMusicType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserPromotionPreferences" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserPromotionPreferences_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserVenuePreferences" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserVenuePreferences_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Location_cityId_idx" ON "Location"("cityId");

-- CreateIndex
CREATE INDEX "Location_lat_lng_idx" ON "Location"("lat", "lng");

-- CreateIndex
CREATE INDEX "City_city_idx" ON "City"("city");

-- CreateIndex
CREATE INDEX "Event_venueId_startDate_eventTypeId_idx" ON "Event"("venueId", "startDate", "eventTypeId");

-- CreateIndex
CREATE INDEX "Promotion_venueId_startDate_promotionTypeId_idx" ON "Promotion"("venueId", "startDate", "promotionTypeId");

-- CreateIndex
CREATE INDEX "Venue_venueTypeId_idx" ON "Venue"("venueTypeId");

-- CreateIndex
CREATE INDEX "Venue_locationId_idx" ON "Venue"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_phoneNumber_idx" ON "User"("email", "phoneNumber");

-- CreateIndex
CREATE INDEX "_UserEventPreferences_B_index" ON "_UserEventPreferences"("B");

-- CreateIndex
CREATE INDEX "_VenueMusicType_B_index" ON "_VenueMusicType"("B");

-- CreateIndex
CREATE INDEX "_UserPromotionPreferences_B_index" ON "_UserPromotionPreferences"("B");

-- CreateIndex
CREATE INDEX "_UserVenuePreferences_B_index" ON "_UserVenuePreferences"("B");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_currencyCodeId_fkey" FOREIGN KEY ("currencyCodeId") REFERENCES "CurrencyCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_timeZoneId_fkey" FOREIGN KEY ("timeZoneId") REFERENCES "TimeZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_eventCategoryId_fkey" FOREIGN KEY ("eventCategoryId") REFERENCES "EventCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionType" ADD CONSTRAINT "PromotionType_promotionCategoryId_fkey" FOREIGN KEY ("promotionCategoryId") REFERENCES "PromotionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_promotionTypeId_fkey" FOREIGN KEY ("promotionTypeId") REFERENCES "PromotionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_venueTypeId_fkey" FOREIGN KEY ("venueTypeId") REFERENCES "VenueType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionForId_fkey" FOREIGN KEY ("permissionForId") REFERENCES "PermissionFor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionTypeId_fkey" FOREIGN KEY ("permissionTypeId") REFERENCES "PermissionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_notificationForId_fkey" FOREIGN KEY ("notificationForId") REFERENCES "NotificationFor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_notificationTypeId_fkey" FOREIGN KEY ("notificationTypeId") REFERENCES "NotificationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccount" ADD CONSTRAINT "LinkedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedAccount" ADD CONSTRAINT "LinkedAccount_linkedAccountTypeId_fkey" FOREIGN KEY ("linkedAccountTypeId") REFERENCES "LinkedAccountType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_currencyCodeId_fkey" FOREIGN KEY ("currencyCodeId") REFERENCES "CurrencyCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentStatusId_fkey" FOREIGN KEY ("paymentStatusId") REFERENCES "PaymentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserEventPreferences" ADD CONSTRAINT "_UserEventPreferences_A_fkey" FOREIGN KEY ("A") REFERENCES "EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserEventPreferences" ADD CONSTRAINT "_UserEventPreferences_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VenueMusicType" ADD CONSTRAINT "_VenueMusicType_A_fkey" FOREIGN KEY ("A") REFERENCES "EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VenueMusicType" ADD CONSTRAINT "_VenueMusicType_B_fkey" FOREIGN KEY ("B") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPromotionPreferences" ADD CONSTRAINT "_UserPromotionPreferences_A_fkey" FOREIGN KEY ("A") REFERENCES "PromotionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPromotionPreferences" ADD CONSTRAINT "_UserPromotionPreferences_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserVenuePreferences" ADD CONSTRAINT "_UserVenuePreferences_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserVenuePreferences" ADD CONSTRAINT "_UserVenuePreferences_B_fkey" FOREIGN KEY ("B") REFERENCES "VenueType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
