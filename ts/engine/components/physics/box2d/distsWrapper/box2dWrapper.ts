// FIXME: add more types to the physics part of taro2

const box2dWrapper: PhysicsDistProps = {
	init: function (component) {
		// component.b2AABB = box2dweb.Collision.b2AABB; // added by Jaeyun for world collision detection for raycast bullets
		// console.log(box2DJS);

		if (typeof box2DJS != 'function') return;
		box2DJS().then(function (box2D) {
			component.b2Color = box2D.b2Color;
			component.b2Vec2 = box2D.b2Vec2;
			component.b2Math = box2D.b2Math;
			component.b2Shape = box2D.b2Shape;
			component.b2BodyDef = box2D.b2BodyDef;
			component.b2Body = box2D.b2Body;
			component.b2Joint = box2D.b2Joint;
			component.b2FixtureDef = box2D.b2FixtureDef;
			component.b2Fixture = box2D.b2Fixture;
			component.b2World = box2D.b2World;
			component.b2MassData = box2D.b2MassData;
			component.b2PolygonShape = box2D.b2PolygonShape;
			component.b2CircleShape = box2D.b2CircleShape;
			component.b2DebugDraw = box2D.b2DebugDraw;
			component.JSContactListener = box2D.JSContactListener;
			component.b2Distance = box2D.b2Distance;
			component.b2FilterData = box2D.b2FilterData;
			component.b2DistanceJointDef = box2D.b2DistanceJointDef;

			// aliases for camelcase
			component.b2World.prototype.isLocked = component.b2World.prototype.IsLocked;
			component.b2World.prototype.createBody = component.b2World.prototype.CreateBody;
			component.b2World.prototype.destroyBody = component.b2World.prototype.DestroyBody;
			// component.b2World.prototype.createJoint = component.b2World.prototype.CreateJoint;
			component.b2World.prototype.destroyJoint = component.b2World.prototype.DestroyJoint;
			component.b2World.prototype.createFixture = component.b2World.prototype.CreateFixture;
			component.b2World.prototype.clearForces = component.b2World.prototype.ClearForces;
			component.b2World.prototype.getBodyList = component.b2World.prototype.GetBodyList;
			component.b2World.prototype.getJointList = component.b2World.prototype.GetJointList;
			component.b2World.prototype.getFixtureList = component.b2World.prototype.GetFixtureList;
			component.b2World.prototype.step = component.b2World.prototype.Step;
			component.b2World.prototype.rayCast = component.b2World.prototype.RayCast;

			// signature is backwards!
			/*
				component.b2World.prototype.queryAABB = function(aabb, queryCallback){
					return component.b2World.prototype.QueryAABB(queryCallback,aabb);
				}
				*/

			component.b2Body.prototype.getNext = component.b2Body.prototype.GetNext;
			component.b2Body.prototype.getAngle = component.b2Body.prototype.GetAngle;
			component.b2Body.prototype.setPosition = component.b2Body.prototype.SetPosition;
			component.b2Body.prototype.getPosition = component.b2Body.prototype.GetPosition;
			component.b2Body.prototype.setGravityScale = component.b2Body.prototype.SetGravityScale;
			component.b2Body.prototype.setAngle = component.b2Body.prototype.SetAngle;
			component.b2Body.prototype.setTransform = component.b2Body.prototype.SetTransform;
			component.b2Body.prototype.isAwake = component.b2Body.prototype.IsAwake;
			component.b2Body.prototype.setAwake = component.b2Body.prototype.SetAwake;
			component.b2Body.prototype.setLinearVelocity = component.b2Body.prototype.SetLinearVelocity;
			component.b2Body.prototype.getLinearVelocity = component.b2Body.prototype.GetLinearVelocity;
			component.b2Body.prototype.applyLinearImpulse = component.b2Body.prototype.ApplyLinearImpulse;
			component.b2Body.prototype.getWorldCenter = component.b2Body.prototype.GetWorldCenter;
			component.b2Body.prototype.applyForce = component.b2Body.prototype.ApplyForce;
			component.b2Vec2.prototype.set = component.b2Vec2.prototype.Set;
			// component.b2Vec2.prototype.setV = component.b2Vec2.prototype.SetV;

			component.b2Joint.prototype.getNext = component.b2Joint.prototype.GetNext;
		});
	},

	contactListener: function (self, beginContactCallback, endContactCallback, preSolve, postSolve) {
		var contactListener = new self.JSContactListener();
		if (beginContactCallback !== undefined) {
			contactListener.BeginContact = beginContactCallback;
		}

		if (endContactCallback !== undefined) {
			contactListener.EndContact = endContactCallback;
		}

		if (preSolve !== undefined) {
			contactListener.PreSolve = preSolve;
		}

		if (postSolve !== undefined) {
			contactListener.PostSolve = postSolve;
		}
		self._world.SetContactListener(contactListener);
	},

	getmxfp: function (body) {
		return body.m_xf.p;
	},

	queryAABB: function (self, aabb, callback) {
		var cb = {
			ReportFixture: function (fixture) {
				callback(fixture);
			}
		};

		self.world().QueryAABB(cb, aabb);
	},

	createBody: function (self, entity, body) {
		PhysicsComponent.prototype.log(`createBody of ${entity._stats.name}`);

		// immediately destroy body if entity already has box2dBody
		if (!entity) {
			PhysicsComponent.prototype.log('warning: creating body for non-existent entity');
			return;
		}

		// if there's already a body, destroy it first
		if (entity.body) {
			PhysicsComponent.prototype.log('body already exists, destroying body');
			self.destroyBody(entity);
		}

		var tempDef = new self.b2BodyDef();
		var param;
		var tempBod;
		var fixtureDef;
		var tempFixture;
		var finalFixture;
		var tempShape;
		var tempFilterData;
		var i;
		var finalX; var finalY;
		var finalWidth; var finalHeight;

		// Process body definition and create a box2d body for it
		box2DJS().then(function (box2D) {
			switch (body.type) {
				case 'static':
					tempDef.type = box2D.b2_staticBody;
					break;

				case 'dynamic':
					tempDef.type = box2D.b2_dynamicBody;
					break;

				case 'kinematic':
					tempDef.type = box2D.b2_kinematicBody;
					break;
			}
		});

		// Add the parameters of the body to the new body instance
		for (param in body) {
			if (body.hasOwnProperty(param)) {
				switch (param) {
					case 'type':
					case 'gravitic':
					case 'fixedRotation':
					case 'fixtures':
						// Ignore these for now, we process them
						// below as post-creation attributes
						break;

					default:
						tempDef[param] = body[param];
						break;
				}
			}
		}

		// Set the position
		tempDef.position = new self.b2Vec2(entity._translate.x / self._scaleRatio, entity._translate.y / self._scaleRatio);

		// Create the new body
		tempBod = self._world.CreateBody(tempDef);

		// Now apply any post-creation attributes we need to
		for (param in body) {
			if (body.hasOwnProperty(param)) {
				switch (param) {
					case 'gravitic':
						if (!body.gravitic) {
							tempBod.m_nonGravitic = true;
						}
						break;

					case 'fixedRotation':
						if (body.fixedRotation) {
							tempBod.SetFixedRotation(true);
						}
						break;

					case 'fixtures':
						if (body.fixtures && body.fixtures.length) {
							for (i = 0; i < body.fixtures.length; i++) {
								// Grab the fixture definition
								fixtureDef = body.fixtures[i];

								// Create the fixture
								tempFixture = self.createFixture(fixtureDef);
								tempFixture.taroId = fixtureDef.taroId;

								// Check for a shape definition for the fixture
								if (fixtureDef.shape) {
									// Create based on the shape type
									switch (fixtureDef.shape.type) {
										case 'circle':
											tempShape = new self.b2CircleShape();

											/*
												if (fixtureDef.shape.data && typeof(fixtureDef.shape.data.radius) !== 'undefined') {
													tempShape.SetRadius(fixtureDef.shape.data.radius / self._scaleRatio);
												} else {
													tempShape.SetRadius((entity._bounds2d.x / self._scaleRatio) / 2);
												}

												if (fixtureDef.shape.data) {
													finalX = fixtureDef.shape.data.x !== undefined ? fixtureDef.shape.data.x : 0;
													finalY = fixtureDef.shape.data.y !== undefined ? fixtureDef.shape.data.y : 0;

													tempShape.SetLocalPosition(new self.b2Vec2(finalX / self._scaleRatio, finalY / self._scaleRatio));
												}
												*/

											if (fixtureDef.shape.data && typeof (fixtureDef.shape.data.radius) !== 'undefined') {
												// tempShape.SetRadius(fixtureDef.shape.data.radius / self._scaleRatio);
												var p = new self.b2Vec2(finalX / self._scaleRatio, finalY / self._scaleRatio);
												var r = fixtureDef.shape.data.radius / self._scaleRatio;
												tempShape.Set(p, r);
											} else {
												// var r = ((entity._bounds2d.x / self._scaleRatio) / 2);
											}

											break;

										case 'polygon':
											tempShape = new self.b2PolygonShape();
											tempShape.SetAsArray(fixtureDef.shape.data._poly, fixtureDef.shape.data.length());
											break;

										case 'rectangle':
											tempShape = new self.b2PolygonShape();

											if (fixtureDef.shape.data) {
												finalX = fixtureDef.shape.data.x !== undefined ? fixtureDef.shape.data.x : 0;
												finalY = fixtureDef.shape.data.y !== undefined ? fixtureDef.shape.data.y : 0;
												finalWidth = fixtureDef.shape.data.width !== undefined ? fixtureDef.shape.data.width : (entity._bounds2d.x / 2);
												finalHeight = fixtureDef.shape.data.height !== undefined ? fixtureDef.shape.data.height : (entity._bounds2d.y / 2);
											} else {
												finalX = 0;
												finalY = 0;
												finalWidth = (entity._bounds2d.x / 2);
												finalHeight = (entity._bounds2d.y / 2);
											}

											// Set the polygon as a box
											/*
												tempShape.SetAsOrientedBox(
													(finalWidth / self._scaleRatio),
													(finalHeight / self._scaleRatio),
													new self.b2Vec2(finalX / self._scaleRatio, finalY / self._scaleRatio),
													0
												);
												*/

											// review:

											tempShape.SetAsBox(
												(finalWidth / self._scaleRatio),
												(finalHeight / self._scaleRatio)
											);
											break;
									}

									if (tempShape && fixtureDef.filter) {
										tempFixture.shape = tempShape;
										finalFixture = tempBod.CreateFixture(tempFixture);
										finalFixture.taroId = tempFixture.taroId;
									}
								}

								if (fixtureDef.filter && finalFixture) {
									tempFilterData = new box2dts.b2Filter();

									if (fixtureDef.filter.categoryBits !== undefined) {
										tempFilterData.categoryBits = fixtureDef.filter.categoryBits;
									}
									if (fixtureDef.filter.maskBits !== undefined) {
										tempFilterData.maskBits = fixtureDef.filter.maskBits;
									}
									if (fixtureDef.filter.categoryIndex !== undefined) {
										tempFilterData.categoryIndex = fixtureDef.filter.categoryIndex;
									}

									finalFixture.SetFilterData(tempFilterData);
								}

								if (fixtureDef.friction !== undefined && finalFixture) {
									finalFixture.SetFriction(fixtureDef.friction);
								}
								if (fixtureDef.restitution !== undefined && finalFixture) {
									finalFixture.SetRestitution(fixtureDef.restitution);
								}
								if (fixtureDef.density !== undefined && finalFixture) {
									finalFixture.SetDensity(fixtureDef.density);
								}
								if (fixtureDef.isSensor !== undefined && finalFixture) {
									finalFixture.SetSensor(fixtureDef.isSensor);
								}
							}
						} else {
							self.log('Box2D body has no fixtures, have you specified fixtures correctly? They are supposed to be an array of fixture anys.', 'warning');
						}
						break;
				}
			}
		}

		// Store the entity that is linked to self body
		tempBod._entity = entity;

		// Add the body to the world with the passed fixture
		entity.body = tempBod;

		entity.gravitic(!!body.affectedByGravity);

		// rotate body to its previous value
		entity.rotateTo(0, 0, entity._rotate.z);

		// Add the body to the world with the passed fixture
		return tempBod;
	},

	createJoint: function (self, entityA, entityB, anchorA, anchorB) {
		// if joint type none do nothing
		var aBody = entityA._stats.currentBody;
		var bBody = entityB._stats.currentBody;

		if (!aBody || aBody.jointType == 'none' || aBody.type == 'none') return;

		// create a joint only if there isn't pre-existing joint
		PhysicsComponent.prototype.log(`creating ${aBody.jointType} joint between ${entityA._stats.name} and ${entityB._stats.name}`);

		if (
			entityA && entityA.body && entityB && entityB.body &&
			entityA.id() != entityB.id() // im not creating joint to myself!
		) {
			// initialize function assumes that the two anys are in a correct position
			if (aBody.jointType == 'distanceJoint') {
				var joint_def = new box2dts.b2DistanceJointDef();

				joint_def.Initialize(
					entityA.body,
					entityB.body,
					entityA.body.GetWorldCenter(),
					entityB.body.GetWorldCenter());
			} else if (aBody.jointType == 'revoluteJoint') {
				var joint_def = new box2dts.b2RevoluteJointDef();

				joint_def.Initialize(
					entityA.body,
					entityB.body,
					entityA.body.GetWorldCenter(),
					entityB.body.GetWorldCenter());

				// joint_def.enableLimit = true;
				// joint_def.lowerAngle = aBody.itemAnchor.lowerAngle * 0.0174533; // degree to rad
				// joint_def.upperAngle = aBody.itemAnchor.upperAngle * 0.0174533; // degree to rad

				joint_def.localAnchorA.Set(anchorA.x / aBody.width, anchorA.y / aBody.height);
				joint_def.localAnchorB.Set(anchorB.x / bBody.width, anchorB.y / bBody.height);
			} else // weld joint
			{
				var joint_def = new box2dts.b2WeldJointDef();

				joint_def.Initialize(
					entityA.body,
					entityB.body,
					entityA.body.GetWorldCenter()
				);

				// joint_def.frequencyHz = 1;
				// joint_def.dampingRatio = 0;
			}

			var joint = self._world.CreateJoint(joint_def); // joint between two pieces

			// var serverStats = taro.server.getStatus()
			PhysicsComponent.prototype.log('joint created ', aBody.jointType);

			entityA.jointsAttached[entityB.id()] = joint;
			entityB.jointsAttached[entityA.id()] = joint;
		}
	}
};


if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
	module.exports = box2dWrapper;
}
