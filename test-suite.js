import assert from 'node:assert';
import { haversineDistance, getAreaDistance, estimateCost, calculateShares } from './src/lib/distance.ts';
import { validateCustomFare, validateQuantity, validatePhone, validatePlate, validateSafeHours, validateReason } from './src/lib/validators.ts';
import { useAppStore } from './src/store.ts';

console.log('--- STARTING COMPREHENSIVE SUITE OF TESTS ---');

// 1. Distance and Estimate Cost
console.log('Test 1: Distance & Fare Estimations');
{
  const d0 = haversineDistance(12.9716, 77.5946, 12.9716, 77.5946);
  assert.strictEqual(d0, 0, 'Distance between identical points should be 0');

  const distIndiranagarKoramangala = getAreaDistance('indiranagar', 'koramangala');
  assert(distIndiranagarKoramangala > 0, 'Indiranagar to Koramangala distance should be positive');

  const sameAreaDist = getAreaDistance('indiranagar', 'indiranagar');
  assert.strictEqual(sameAreaDist, 1.2, 'Same area minimum distance should be 1.2 km');

  // Estimate cost rounding to nearest 5
  const cost1 = estimateCost(1.2);
  assert(cost1 > 0 && cost1 % 5 === 0, `Cost must be rounded to nearest 5: got ${cost1}`);

  const cost10 = estimateCost(10);
  assert(cost10 > cost1 && cost10 % 5 === 0, `Cost must scale with distance: got ${cost10}`);
  console.log('  ✓ Distance and estimate calculations passed');
}

// 2. Calculate Shares
console.log('Test 2: Delivery Method Shares Calculation');
{
  // SELF_PICKUP
  const spShares = calculateShares('SELF_PICKUP', 150);
  assert.deepStrictEqual(spShares, { donor: 0, receiver: 0 });

  // DONOR_DROP
  const ddShares = calculateShares('DONOR_DROP', 150);
  assert.deepStrictEqual(ddShares, { donor: 0, receiver: 0 });

  // DONOR_PAYS
  const dpShares = calculateShares('DONOR_PAYS', 150);
  assert.deepStrictEqual(dpShares, { donor: 150, receiver: 0 });

  // RECEIVER_PAYS
  const rpShares = calculateShares('RECEIVER_PAYS', 150);
  assert.deepStrictEqual(rpShares, { donor: 0, receiver: 150 });

  // SPLIT - Even
  const splitEven = calculateShares('SPLIT', 120);
  assert.deepStrictEqual(splitEven, { donor: 60, receiver: 60 });
  assert.strictEqual(splitEven.donor + splitEven.receiver, 120);

  // SPLIT - Odd
  const splitOdd = calculateShares('SPLIT', 125);
  assert.deepStrictEqual(splitOdd, { donor: 63, receiver: 62 });
  assert.strictEqual(splitOdd.donor + splitOdd.receiver, 125);

  // SPLIT - 0
  const splitZero = calculateShares('SPLIT', 0);
  assert.deepStrictEqual(splitZero, { donor: 0, receiver: 0 });
  console.log('  ✓ Calculate shares passed for all delivery methods');
}

// 3. Validators
console.log('Test 3: Fare & Input Validators');
{
  assert.strictEqual(validateCustomFare(0).valid, true);
  assert.strictEqual(validateCustomFare(50).valid, true);
  assert.strictEqual(validateCustomFare(120.5).valid, true);
  assert.strictEqual(validateCustomFare(100000).valid, true);

  assert.strictEqual(validateCustomFare(-1).valid, false);
  assert.strictEqual(validateCustomFare(NaN).valid, false);
  assert.strictEqual(validateCustomFare(Infinity).valid, false);
  assert.strictEqual(validateCustomFare(100001).valid, false);
  assert.strictEqual(validateCustomFare('100').valid, false);
  assert.strictEqual(validateCustomFare(null).valid, false);
  assert.strictEqual(validateCustomFare(undefined).valid, false);

  assert.strictEqual(validateQuantity(10).valid, true);
  assert.strictEqual(validateQuantity(0).valid, false);
  assert.strictEqual(validateQuantity(-5).valid, false);
  assert.strictEqual(validateQuantity(10.5).valid, false);
  assert.strictEqual(validateQuantity(15, 10).valid, false);

  assert.strictEqual(validatePhone('9876543210').valid, true);
  assert.strictEqual(validatePhone('123').valid, false);
  assert.strictEqual(validatePlate('KA01AB1234').valid, true);
  assert.strictEqual(validatePlate('KA').valid, false);

  assert.strictEqual(validateSafeHours(4).valid, true);
  assert.strictEqual(validateSafeHours(0).valid, false);
  assert.strictEqual(validateSafeHours(50).valid, false);
  console.log('  ✓ Validators passed all valid and boundary cases');
}

// 4. End-to-End Store Workflow: Custom Fare Negotiation
console.log('Test 4: Store Custom Fare Negotiation & Agreement Flow');
{
  const store = useAppStore.getState();
  store.clearAllData();

  // Register donor
  const donorRes = useAppStore.getState().registerUser({
    role: 'donor',
    name: 'Chef Ramesh',
    phone: '9876543210',
    areaId: 'indiranagar'
  });
  assert(donorRes.ok && donorRes.id);
  const donorId = donorRes.id;

  // Register receiver
  const receiverRes = useAppStore.getState().registerUser({
    role: 'receiver',
    name: 'Sister Mary',
    phone: '9123456789',
    areaId: 'koramangala',
    orgName: 'Mother Teresa Home',
    orgType: 'Shelter'
  });
  assert(receiverRes.ok && receiverRes.id);
  const receiverId = receiverRes.id;

  // Switch to donor to post food
  useAppStore.getState().switchUser(donorId);
  const postRes = useAppStore.getState().createPost({
    foodType: 'Biryani and Dal Makhani',
    eventName: 'Annual Gala Banquet',
    totalQty: 100,
    safeHours: 4,
    locationText: '100ft Road, Indiranagar',
    areaId: 'indiranagar',
    contactPhone: '9876543210'
  });
  assert(postRes.ok && postRes.id);
  const postId = postRes.id;

  // Switch to receiver to accept food
  useAppStore.getState().switchUser(receiverId);
  const acceptRes = useAppStore.getState().acceptPost(postId, 50);
  assert(acceptRes.ok && acceptRes.id);
  const orderId = acceptRes.id;

  let order = useAppStore.getState().orders.find((o) => o.id === orderId);
  assert.strictEqual(order.status, 'ACCEPTED');
  assert.strictEqual(order.qty, 50);

  // Propose custom fare: SPLIT with ₹130 (e.g. verified on Porter/Rapido)
  const proposeRes = useAppStore.getState().proposeMethod(orderId, 'SPLIT', 'receiver', 130);
  assert.strictEqual(proposeRes.ok, true);

  order = useAppStore.getState().orders.find((o) => o.id === orderId);
  assert.strictEqual(order.proposal.method, 'SPLIT');
  assert.strictEqual(order.proposal.proposedBy, 'receiver');
  assert.strictEqual(order.proposal.customCost, 130);

  // Notification sent to donor should mention the proposed method and fare
  const donorNotif = useAppStore.getState().notifications.find((n) => n.toUserId === donorId && n.title === 'Delivery Method Proposed');
  assert(donorNotif, 'Donor must receive delivery proposal notification');
  assert(donorNotif.body.includes('₹130'), `Notification should mention ₹130, got: "${donorNotif.body}"`);

  // Switch to donor to agree
  useAppStore.getState().switchUser(donorId);

  // Receiver cannot agree to their own proposal
  const selfAgree = useAppStore.getState().agreeMethod(orderId, 'receiver');
  assert.strictEqual(selfAgree.ok, false);

  // Donor agrees to proposal
  const agreeRes = useAppStore.getState().agreeMethod(orderId, 'donor');
  assert.strictEqual(agreeRes.ok, true);

  order = useAppStore.getState().orders.find((o) => o.id === orderId);
  assert.strictEqual(order.status, 'CONFIRMED');
  assert.strictEqual(order.method, 'SPLIT');
  assert.strictEqual(order.estCost, 130, 'Agreed order should persist custom fare of 130');
  assert.deepStrictEqual(order.shares, { donor: 65, receiver: 65 }, 'Shares must be 65 each for 130');
  assert.strictEqual(order.proposal, undefined, 'Proposal must be cleared upon confirmation');

  // Adjust cost after confirmed (e.g. driver asked +₹15 toll)
  const adjustRes = useAppStore.getState().adjustOrderCost(orderId, 145);
  assert.strictEqual(adjustRes.ok, true);

  order = useAppStore.getState().orders.find((o) => o.id === orderId);
  assert.strictEqual(order.estCost, 145);
  assert.deepStrictEqual(order.shares, { donor: 73, receiver: 72 });
  assert.deepStrictEqual(order.paymentDone, { donor: false, receiver: false });

  // Test error handling on adjustOrderCost
  const badCostAdjust = useAppStore.getState().adjustOrderCost(orderId, -20);
  assert.strictEqual(badCostAdjust.ok, false);

  console.log('  ✓ End-to-end custom fare negotiation & agreement passed');
}

// 5. Zero-Fare Negotiation & Auto-Payment Satisfaction for Zero Shares
console.log('Test 5: Zero-Fare Proposal, Agreement & Payment Status');
{
  useAppStore.getState().clearAllData();

  const donorRes = useAppStore.getState().registerUser({ role: 'donor', name: 'Chef Anand', phone: '9876543211', areaId: 'indiranagar' });
  const receiverRes = useAppStore.getState().registerUser({ role: 'receiver', name: 'Seva Trust', phone: '9876543212', areaId: 'koramangala', orgName: 'Seva Shelter', orgType: 'Shelter' });
  useAppStore.getState().switchUser(donorRes.id);
  const postRes = useAppStore.getState().createPost({ foodType: 'Khichdi', eventName: 'Community Meal', totalQty: 40, safeHours: 3, locationText: 'Indiranagar', areaId: 'indiranagar', contactPhone: '9876543211' });
  useAppStore.getState().switchUser(receiverRes.id);
  const acceptRes = useAppStore.getState().acceptPost(postRes.id, 40);
  const orderId = acceptRes.id;

  // Propose SPLIT with custom fare 0 (e.g. promo or coupon)
  const propRes = useAppStore.getState().proposeMethod(orderId, 'SPLIT', 'receiver', 0);
  assert.strictEqual(propRes.ok, true);

  let order = useAppStore.getState().orders.find((o) => o.id === orderId);
  assert.strictEqual(order.proposal.customCost, 0, 'Custom cost must be preserved as 0');

  // Donor agrees to 0 fare
  useAppStore.getState().switchUser(donorRes.id);
  const agreeRes = useAppStore.getState().agreeMethod(orderId, 'donor');
  assert.strictEqual(agreeRes.ok, true);

  order = useAppStore.getState().orders.find((o) => o.id === orderId);
  assert.strictEqual(order.status, 'CONFIRMED');
  assert.strictEqual(order.estCost, 0);
  assert.deepStrictEqual(order.shares, { donor: 0, receiver: 0 });
  assert.deepStrictEqual(order.paymentDone, { donor: true, receiver: true }, '0 shares must be automatically marked paid');

  console.log('  ✓ Zero-fare proposal and zero-share auto payment passed');
}

// 6. DONOR_PAYS & Adjust Cost During OUT_FOR_DELIVERY
console.log('Test 6: DONOR_PAYS Shares & Adjusting Cost During OUT_FOR_DELIVERY');
{
  useAppStore.getState().clearAllData();

  const donorRes = useAppStore.getState().registerUser({ role: 'donor', name: 'Chef Meera', phone: '9876543221', areaId: 'indiranagar' });
  const receiverRes = useAppStore.getState().registerUser({ role: 'receiver', name: 'Asha Home', phone: '9876543222', areaId: 'koramangala', orgName: 'Asha Orphanage', orgType: 'Orphanage' });
  useAppStore.getState().switchUser(donorRes.id);
  const postRes = useAppStore.getState().createPost({ foodType: 'Pulao', eventName: 'Charity Drive', totalQty: 60, safeHours: 4, locationText: 'Indiranagar', areaId: 'indiranagar', contactPhone: '9876543221' });
  useAppStore.getState().switchUser(receiverRes.id);
  const acceptRes = useAppStore.getState().acceptPost(postRes.id, 60);
  const orderId = acceptRes.id;

  // Donor proposes DONOR_PAYS with custom quote 160
  useAppStore.getState().switchUser(donorRes.id);
  useAppStore.getState().proposeMethod(orderId, 'DONOR_PAYS', 'donor', 160);

  // Receiver agrees
  useAppStore.getState().switchUser(receiverRes.id);
  useAppStore.getState().agreeMethod(orderId, 'receiver');

  let order = useAppStore.getState().orders.find((o) => o.id === orderId);
  assert.strictEqual(order.estCost, 160);
  assert.deepStrictEqual(order.shares, { donor: 160, receiver: 0 });
  assert.deepStrictEqual(order.paymentDone, { donor: false, receiver: true }, 'Receiver owes 0 so paymentDone.receiver must be true');

  // Save transport -> READY
  useAppStore.getState().saveTransport(orderId, {
    vehicleType: 'Auto',
    numberPlate: 'KA01CD5678',
    phone: '9876543221',
    etaAt: Date.now() + 1800000
  });

  order = useAppStore.getState().orders.find((o) => o.id === orderId);
  assert.strictEqual(order.status, 'READY');

  // Start delivery -> OUT_FOR_DELIVERY
  useAppStore.getState().startDelivery(orderId);
  order = useAppStore.getState().orders.find((o) => o.id === orderId);
  assert.strictEqual(order.status, 'OUT_FOR_DELIVERY');

  // Driver adds toll during delivery -> adjust cost to 185
  const adjustRes = useAppStore.getState().adjustOrderCost(orderId, 185);
  assert.strictEqual(adjustRes.ok, true, 'adjustOrderCost must be permitted during OUT_FOR_DELIVERY');

  order = useAppStore.getState().orders.find((o) => o.id === orderId);
  assert.strictEqual(order.estCost, 185);
  assert.deepStrictEqual(order.shares, { donor: 185, receiver: 0 });
  assert.deepStrictEqual(order.paymentDone, { donor: false, receiver: true });

  console.log('  ✓ DONOR_PAYS shares and mid-delivery cost adjustment passed');
}

// 7. Time Offset Consistency in Notifications
console.log('Test 7: Simulated Time Offset in Notifications');
{
  useAppStore.getState().clearAllData();

  const donorRes = useAppStore.getState().registerUser({ role: 'donor', name: 'Chef Vikram', phone: '9876543231', areaId: 'indiranagar' });
  const receiverRes = useAppStore.getState().registerUser({ role: 'receiver', name: 'Prerna NGO', phone: '9876543232', areaId: 'koramangala', orgName: 'Prerna', orgType: 'NGO' });

  // Add 2 hours time offset
  const offsetMs = 2 * 3600 * 1000;
  useAppStore.getState().addTimeOffset(offsetMs);

  useAppStore.getState().switchUser(donorRes.id);
  const postRes = useAppStore.getState().createPost({ foodType: 'Thali', eventName: 'Dinner Event', totalQty: 30, safeHours: 3, locationText: 'Indiranagar', areaId: 'indiranagar', contactPhone: '9876543231' });

  // Notifications created should have createdAt reflecting the offset time
  const notif = useAppStore.getState().notifications.find((n) => n.toUserId === receiverRes.id);
  assert(notif, 'Notification must exist');
  const expectedMinTime = Date.now() + offsetMs - 5000;
  assert(notif.createdAt >= expectedMinTime, `Notification createdAt (${notif.createdAt}) must incorporate time offset (>= ${expectedMinTime})`);

  useAppStore.getState().resetTimeOffset();
  console.log('  ✓ Simulated time offset in notifications passed');
}

// 8. Zero-Waste Fallback: 30-Min Expiry Alert & Animal Shelter/Gaushala Dispatch
console.log('Test 8: Zero-Waste Fallback: 30-Min Expiry Alert & Gaushala Dispatch');
{
  useAppStore.getState().clearAllData();

  const donorRes = useAppStore.getState().registerUser({
    role: 'donor',
    name: 'Chef Rajesh',
    phone: '9876543241',
    areaId: 'indiranagar'
  });

  useAppStore.getState().switchUser(donorRes.id);

  // 1 hour safe window
  const postRes = useAppStore.getState().createPost({
    foodType: 'Curd Rice & Sambar',
    eventName: 'Temple Mahaprasad',
    totalQty: 50,
    safeHours: 1,
    locationText: 'Indiranagar 100ft Rd',
    areaId: 'indiranagar',
    contactPhone: '9876543241'
  });

  let post = useAppStore.getState().posts.find((p) => p.id === postRes.id);
  assert(post, 'Post must be created');
  assert.strictEqual(post.remainingQty, 50);
  assert.strictEqual(post.warnedAt30, false);

  // Advance clock by 35 minutes -> 25 minutes remaining (<= 30 mins)
  useAppStore.getState().addTimeOffset(35 * 60 * 1000);
  useAppStore.getState().runExpiryCheck();

  post = useAppStore.getState().posts.find((p) => p.id === postRes.id);
  assert.strictEqual(post.warnedAt30, true, 'warnedAt30 must be true after reaching <30 mins');

  // Verify warning notification sent to donor
  const warnNotif = useAppStore.getState().notifications.find(
    (n) => n.toUserId === donorRes.id && n.title.includes('30 Mins')
  );
  assert(warnNotif, '30-minute emergency warning notification must be delivered to donor');
  assert(warnNotif.body.includes('Gaushala') || warnNotif.body.includes('animal shelters'), 'Notification must mention Gaushala fallback');

  // Donor dispatches surplus food to Gaushala via Goodwill Courier (fare ₹80)
  const dispatchRes = useAppStore.getState().dispatchToAnimalFeed(post.id, {
    shelterId: 'blr_gau_1',
    shelterName: 'Sri Krishna Gaushala & Cattle Care',
    deliveryType: 'transport',
    fare: 80,
    phone: '+91 98450 11223'
  });

  assert.strictEqual(dispatchRes.ok, true, 'dispatchToAnimalFeed should succeed');

  post = useAppStore.getState().posts.find((p) => p.id === postRes.id);
  assert.strictEqual(post.remainingQty, 0, 'Remaining food must be set to 0 after full dispatch');
  assert.strictEqual(post.status, 'EXPIRED', 'Status should be marked EXPIRED/Rescued');
  assert(post.animalFeedDispatch, 'animalFeedDispatch record must be saved');
  assert.strictEqual(post.animalFeedDispatch.shelterName, 'Sri Krishna Gaushala & Cattle Care');
  assert.strictEqual(post.animalFeedDispatch.deliveryType, 'transport');
  assert.strictEqual(post.animalFeedDispatch.fare, 80);
  assert.strictEqual(post.animalFeedDispatch.qty, 50);

  // Verify completion notification
  const feedNotif = useAppStore.getState().notifications.find(
    (n) => n.toUserId === donorRes.id && n.title.includes('Food Dispatched to Gaushala')
  );
  assert(feedNotif, 'Dispatched to Gaushala notification must be delivered to donor');
  assert(feedNotif.body.includes('100% zero waste achieved!'));

  // Prevent double dispatch
  const reDispatch = useAppStore.getState().dispatchToAnimalFeed(post.id, {
    shelterId: 'blr_gau_2',
    shelterName: 'Another Shelter',
    deliveryType: 'self',
    phone: '+91 98450 99999'
  });
  assert.strictEqual(reDispatch.ok, false);
  assert.strictEqual(reDispatch.message, 'No surplus food remaining to dispatch');

  useAppStore.getState().resetTimeOffset();
  console.log('  ✓ 30-min warning alert and Gaushala dispatch flow passed');
}

console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---');
