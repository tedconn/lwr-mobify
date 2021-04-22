/*  *******************************************************************************************
 *  ATTENTION!
 *  THIS IS A GENERATED FILE FROM https://github.com/salesforce/lds-lightning-platform
 *  If you would like to contribute to LDS, please follow the steps outlined in the git repo.
 *  Any changes made to this file in p4 will be automatically overwritten.
 *  *******************************************************************************************
 */
/* proxy-compat-disable */
import { registerLdsCacheStats, incrementGetRecordAggregateInvokeCount, setAggregateUiChunkCountMetric, incrementGetRecordNormalInvokeCount, logCRUDLightningInteraction, incrementNetworkRateLimitExceededCount } from 'force/ldsInstrumentation';
import { executeGlobalController } from 'aura';
import { createStorage } from 'force/ldsStorage';
import { getEnvironmentSetting, EnvironmentSettings } from 'force/ldsEnvironmentSettings';

var SnapshotState;
(function (SnapshotState) {
    SnapshotState["Fulfilled"] = "Fulfilled";
    SnapshotState["Unfulfilled"] = "Unfulfilled";
    SnapshotState["Error"] = "Error";
    SnapshotState["Pending"] = "Pending";
    SnapshotState["Stale"] = "Stale";
})(SnapshotState || (SnapshotState = {}));

var StoreLinkStateValues;
(function (StoreLinkStateValues) {
    StoreLinkStateValues[StoreLinkStateValues["NotPresent"] = 0] = "NotPresent";
    StoreLinkStateValues[StoreLinkStateValues["RefNotPresent"] = 1] = "RefNotPresent";
    StoreLinkStateValues[StoreLinkStateValues["RefPresent"] = 2] = "RefPresent";
    StoreLinkStateValues[StoreLinkStateValues["Null"] = 3] = "Null";
    StoreLinkStateValues[StoreLinkStateValues["Missing"] = 4] = "Missing";
    StoreLinkStateValues[StoreLinkStateValues["Pending"] = 5] = "Pending";
})(StoreLinkStateValues || (StoreLinkStateValues = {}));

var StoreResolveResultState;
(function (StoreResolveResultState) {
    StoreResolveResultState[StoreResolveResultState["Found"] = 0] = "Found";
    StoreResolveResultState[StoreResolveResultState["Error"] = 1] = "Error";
    StoreResolveResultState[StoreResolveResultState["Null"] = 2] = "Null";
    StoreResolveResultState[StoreResolveResultState["NotPresent"] = 3] = "NotPresent";
})(StoreResolveResultState || (StoreResolveResultState = {}));
var FragmentReadResultState;
(function (FragmentReadResultState) {
    FragmentReadResultState[FragmentReadResultState["Missing"] = 0] = "Missing";
    FragmentReadResultState[FragmentReadResultState["Success"] = 1] = "Success";
    FragmentReadResultState[FragmentReadResultState["Error"] = 2] = "Error";
})(FragmentReadResultState || (FragmentReadResultState = {}));
const FRAGMENT_READ_RESULT_MISSING = {
    state: FragmentReadResultState.Missing,
};

// Cannot use a symbol because we cannot serialize a symbol
// Also, IE11 polyfill have problems when a lot of symbols
// are created
var StoreErrorStatus;
(function (StoreErrorStatus) {
    StoreErrorStatus[StoreErrorStatus["RESOURCE_NOT_FOUND"] = 404] = "RESOURCE_NOT_FOUND";
})(StoreErrorStatus || (StoreErrorStatus = {}));
var StoreRecordType;
(function (StoreRecordType) {
    StoreRecordType["Error"] = "error";
})(StoreRecordType || (StoreRecordType = {}));
var GraphNodeType;
(function (GraphNodeType) {
    GraphNodeType["Link"] = "Link";
    GraphNodeType["Node"] = "Node";
    GraphNodeType["Error"] = "Error";
})(GraphNodeType || (GraphNodeType = {}));

var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["Ok"] = 200] = "Ok";
    HttpStatusCode[HttpStatusCode["Created"] = 201] = "Created";
    HttpStatusCode[HttpStatusCode["NoContent"] = 204] = "NoContent";
    HttpStatusCode[HttpStatusCode["NotModified"] = 304] = "NotModified";
    HttpStatusCode[HttpStatusCode["NotFound"] = 404] = "NotFound";
    HttpStatusCode[HttpStatusCode["BadRequest"] = 400] = "BadRequest";
    HttpStatusCode[HttpStatusCode["ServerError"] = 500] = "ServerError";
})(HttpStatusCode || (HttpStatusCode = {}));
// engine version: 0.31.2-47f0217

class AuraFetchResponse {
    constructor(status, body, headers) {
        this.status = status;
        this.body = body;
        this.headers = headers || {};
    }
    get statusText() {
        const { status } = this;
        switch (status) {
            case HttpStatusCode.Ok:
                return 'OK';
            case HttpStatusCode.NotModified:
                return 'Not Modified';
            case HttpStatusCode.NotFound:
                return 'Not Found';
            case HttpStatusCode.BadRequest:
                return 'Bad Request';
            case HttpStatusCode.ServerError:
                return 'Server Error';
            default:
                return `Unexpected HTTP Status Code: ${status}`;
        }
    }
    get ok() {
        return this.status === 200;
    }
}

const { push, join } = Array.prototype;
const { isArray } = Array;
const { create, entries, keys } = Object;
const { parse, stringify } = JSON;

const router = create(null);
router.methods = {};
['delete', 'get', 'patch', 'post', 'put'].forEach(method => {
    router[method] = function (predicate, handler) {
        const routes = this.methods[method] || [];
        routes.push({ predicate, handler });
        this.methods[method] = routes;
    };
});
router.lookup = function (resourceRequest) {
    const { baseUri, basePath, method } = resourceRequest;
    const path = `${baseUri}${basePath}`;
    const routes = this.methods[method];
    if (routes === undefined || routes.length === 0) {
        return null;
    }
    const matchedRoute = routes.find(route => route.predicate(path));
    if (matchedRoute !== undefined) {
        return matchedRoute.handler;
    }
    else {
        return null;
    }
};

const APEX_BASE_URI = '/apex';
const ApexController = 'ApexActionController.execute';
function executeApex(resourceRequest) {
    const { body } = resourceRequest;
    return dispatchApexAction(ApexController, body, {
        background: false,
        hotspot: false,
        longRunning: body.isContinuation,
    });
}
function dispatchApexAction(endpoint, params, config) {
    return executeGlobalController(endpoint, params, config).then((body) => {
        // massage aura action response to
        //  headers: { cacheable }
        //  body: returnValue
        return new AuraFetchResponse(HttpStatusCode.Ok, body.returnValue === undefined ? null : body.returnValue, 
        // Headers expects properties of [name: string]: string
        // However this is a synthetic header and we want to keep the boolean
        { cacheable: body.cacheable });
    }, err => {
        // Handle ConnectedInJava exception shapes
        if (err.data !== undefined && err.data.statusCode !== undefined) {
            const { data } = err;
            throw new AuraFetchResponse(data.statusCode, data);
        }
        // Handle all the other kind of errors
        throw new AuraFetchResponse(HttpStatusCode.ServerError, err);
    });
}
router.post((path) => path === APEX_BASE_URI, executeApex);

const defaultActionConfig = {
    background: false,
    hotspot: true,
    longRunning: false,
};
function createOkResponse(body) {
    return new AuraFetchResponse(HttpStatusCode.Ok, body);
}
/** Invoke an Aura controller with the pass parameters. */
function dispatchAction(endpoint, params, config = {}, instrumentationCallbacks = {}) {
    const { action: actionConfig, cache: cacheConfig } = config;
    const fetchFromNetwork = () => {
        return executeGlobalController(endpoint, params, actionConfig).then((body) => {
            // If a cache is passed, store the action body in the cache before returning the
            // value. Even though `AuraStorage.set` is an asynchronous operation we don't
            // need to wait for the store to resolve/reject before returning the value.
            // Swallow the error to not have an unhandled promise rejection.
            if (cacheConfig !== undefined && cacheConfig.storage !== null) {
                cacheConfig.storage.set(cacheConfig.key, body).catch(_error => { });
            }
            if (instrumentationCallbacks.resolveFn) {
                instrumentationCallbacks.resolveFn({
                    body,
                    params,
                });
            }
            return createOkResponse(body);
        }, err => {
            if (instrumentationCallbacks.rejectFn) {
                instrumentationCallbacks.rejectFn({
                    err,
                    params,
                });
            }
            // Handle ConnectedInJava exception shapes
            if (err.data !== undefined && err.data.statusCode !== undefined) {
                const { data } = err;
                throw new AuraFetchResponse(data.statusCode, data);
            }
            // Handle all the other kind of errors
            throw new AuraFetchResponse(HttpStatusCode.ServerError, {
                error: err.message,
            });
        });
    };
    // If no cache is passed or if the action should be refreshed, directly fetch the action from
    // the server.
    if (cacheConfig === undefined ||
        cacheConfig.forceRefresh === true ||
        cacheConfig.storage === null) {
        return fetchFromNetwork();
    }
    // Otherwise check for the action body in the cache. If action is not present in the cache or if
    // the cache lookup fails for any reason fallback to the network.
    return cacheConfig.storage.get(cacheConfig.key).then(cacheResult => {
        if (cacheResult !== undefined) {
            cacheConfig.statsLogger.logHits();
            return createOkResponse(cacheResult);
        }
        cacheConfig.statsLogger.logMisses();
        return fetchFromNetwork();
    }, () => {
        return fetchFromNetwork();
    });
}
/**
 * All the methods exposed out of the UiApiController accept a clientOption config. This method
 * adds methods returns a new params object with the client option if necessary, otherwise it
 * returns the passed params object.
 */
function buildUiApiParams(params, resourceRequest) {
    const fixedParams = fixParamsForAuraController(params);
    const ifModifiedSince = resourceRequest.headers['If-Modified-Since'];
    const ifUnmodifiedSince = resourceRequest.headers['If-Unmodified-Since'];
    let clientOptions = {};
    if (ifModifiedSince !== undefined) {
        clientOptions.ifModifiedSince = ifModifiedSince;
    }
    if (ifUnmodifiedSince !== undefined) {
        clientOptions.ifUnmodifiedSince = ifUnmodifiedSince;
    }
    return keys(clientOptions).length > 0
        ? { ...fixedParams, clientOptions: clientOptions }
        : fixedParams;
}
// parameters that need a "Param" suffix appended
const SUFFIXED_PARAMETERS = ['desc', 'page', 'sort'];
const SUFFIX = 'Param';
/**
 * The connect generation code appends a "Param" suffix to certain parameter names when
 * generating Aura controllers. This function accepts a set of UiApiParams and returns
 * an equivalent UiApiParams suitable for passing to an Aura controller.
 */
function fixParamsForAuraController(params) {
    let updatedParams = params;
    for (let i = 0; i < SUFFIXED_PARAMETERS.length; ++i) {
        const param = SUFFIXED_PARAMETERS[i];
        if (updatedParams[param] !== undefined) {
            if (updatedParams === params) {
                updatedParams = { ...params };
            }
            updatedParams[param + SUFFIX] = updatedParams[param];
            delete updatedParams[param];
        }
    }
    return updatedParams;
}
/** Returns true if an action should ignore the network cache data. */
function shouldForceRefresh(resourceRequest) {
    const cacheControl = resourceRequest.headers['Cache-Control'];
    return cacheControl !== undefined || cacheControl === 'no-cache';
}
function registerApiFamilyRoutes(apiFamily) {
    keys(apiFamily).forEach(adapterName => {
        const adapter = apiFamily[adapterName];
        const { method, predicate, transport } = adapter;
        router[method](predicate, {
            [`${adapterName}`]: function (resourceRequest) {
                const actionConfig = {
                    action: transport.action === undefined ? defaultActionConfig : transport.action,
                };
                const { urlParams, queryParams, body } = resourceRequest;
                const params = {
                    ...body,
                    ...fixParamsForAuraController(urlParams),
                    ...fixParamsForAuraController(queryParams),
                };
                return dispatchAction(transport.controller, params, actionConfig, {});
            },
        }[adapterName]);
    });
}

const BASE_URI = '/services/data/v53.0';
const CONNECT_BASE_URI = `${BASE_URI}/connect`;
const COMMERCE_BASE_URI = `${BASE_URI}/commerce`;
const GUIDANCE_BASE_URI = `${BASE_URI}/guidance`;
const WAVE_BASE_URI = `${BASE_URI}/wave`;

const COMMUNITIES_NAVIGATION_MENU_PATH = new RegExp(`${CONNECT_BASE_URI}/communities/([A-Z0-9]){15,18}/navigation-menu`, 'i');
const GET_PRODUCT_PATH = new RegExp(`${COMMERCE_BASE_URI}/webstores/([A-Z0-9]){15,18}/products/([A-Z0-9]){15,18}`, 'i');
const GET_PRODUCT_CATEGORY_PATH_PATH = new RegExp(`${COMMERCE_BASE_URI}/webstores/([A-Z0-9]){15,18}/product-category-path/product-categories/([A-Z0-9]){15,18}`, 'i');
const PRODUCT_SEARCH_PATH = new RegExp(`${COMMERCE_BASE_URI}/webstores/([A-Z0-9]){15,18}/search/product-search`, 'i');
const GET_PRODUCT_PRICE_PATH = new RegExp(`${COMMERCE_BASE_URI}/webstores/([A-Z0-9]){15,18}/pricing/products/([A-Z0-9]){15,18}`, 'i');
const GET_GUIDANCE_ASSISTANT_PATH = new RegExp(`${GUIDANCE_BASE_URI}/assistant/([A-Z0-9_]){1,64}$`, 'i');
const GET_GUIDANCE_QUESTIONNAIRE_PATH = new RegExp(`${GUIDANCE_BASE_URI}/assistant/([A-Z0-9_]){1,64}/questionnaire/([A-Z0-9_]){2,32}$`, 'i');
const GET_GUIDANCE_ACTIVE_QUESTIONNAIRES_PATH = new RegExp(`${GUIDANCE_BASE_URI}/assistant/([A-Z0-9_]){1,64}/questionnaires$`, 'i');
const GET_GUIDANCE_ACTIVE_SCENARIOS_PATH = new RegExp(`${GUIDANCE_BASE_URI}/assistant/([A-Z0-9_]){1,64}/scenarios$`, 'i');
const ANALYTICS_LIMITS_PATH = new RegExp(`${WAVE_BASE_URI}/limits$`, 'i');
const DATAFLOW_JOBS_PATH = new RegExp(`${WAVE_BASE_URI}/dataflowjobs$`, 'i');
const DATAFLOW_JOB_PATH = new RegExp(`${WAVE_BASE_URI}/dataflowjobs/([A-Z0-9_]){15,18}$`, 'i');
const DATAFLOW_JOB_NODES_PATH = new RegExp(`${WAVE_BASE_URI}/dataflowjobs/([A-Z0-9_]){15,18}/nodes$`, 'i');
const DATAFLOW_JOB_NODE_PATH = new RegExp(`${WAVE_BASE_URI}/dataflowjobs/([A-Z0-9_]){15,18}/nodes/([A-Z0-9_]){15,18}$`, 'i');
const EXECUTE_QUERY_PATH = new RegExp(`${WAVE_BASE_URI}/query`, 'i');
const RECIPES_PATH = new RegExp(`${WAVE_BASE_URI}/recipes$`, 'i');
const RECIPE_PATH = new RegExp(`${WAVE_BASE_URI}/recipes/([A-Z0-9_]){15,18}$`, 'i');
const REPLICATED_DATASETS_PATH = new RegExp(`${WAVE_BASE_URI}/replicatedDatasets$`, 'i');
const SCHEDULE_PATH = new RegExp(`${WAVE_BASE_URI}/asset/([A-Z0-9_]){15,18}/schedule$`, 'i');
const DATASETS_PATH = new RegExp(`${WAVE_BASE_URI}/datasets$`, 'i');
const DATASET_PATH = new RegExp(`${WAVE_BASE_URI}/datasets/([A-Z0-9_]){1,80}$`, 'i');
const XMD_PATH = new RegExp(`${WAVE_BASE_URI}/datasets/([A-Z0-9_]){1,80}/versions/([A-Z0-9_]){15,18}/xmds/[A-Z]+$`, 'i');
const WAVE_FOLDERS_PATH = new RegExp(`${WAVE_BASE_URI}/folders$`, 'i');
const LIST_CONTENT_INTERNAL_PATH = new RegExp(`${CONNECT_BASE_URI}/communities/([A-Z0-9]){15,18}/managed-content/delivery/contents`, 'i');
const LIST_CONTENT_PATH = new RegExp(`${CONNECT_BASE_URI}/communities/([A-Z0-9]){15,18}/managed-content/delivery`, 'i');
const RECORD_SEO_PROPERTIES_PATH = new RegExp(`${CONNECT_BASE_URI}/communities/([A-Z0-9]){15,18}/seo/properties/([^\\s]){1,128}`, 'i');
const PUBLISH_ORCHESTRATION_EVENT_PATH = new RegExp(`${CONNECT_BASE_URI}/interaction/orchestration/events$`, 'i');
const GET_ORCHESTRATION_INSTANCE_COLLECTION_PATH = new RegExp(`${CONNECT_BASE_URI}/interaction/orchestration/instances$`, 'i');
const GET_ORCHESTRATION_INSTANCE_PATH = new RegExp(`${CONNECT_BASE_URI}/interaction/orchestration/instances/([A-Z0-9]){15,18}$`, 'i');
const SITES_SEARCH_PATH = new RegExp(`${CONNECT_BASE_URI}/sites/([A-Z0-9]){15,18}/search`, 'i');
const connect = {
    getCommunityNavigationMenu: {
        method: 'get',
        predicate: (path) => path.startsWith(CONNECT_BASE_URI) && COMMUNITIES_NAVIGATION_MENU_PATH.test(path),
        transport: {
            controller: 'NavigationMenuController.getCommunityNavigationMenu',
        },
    },
    listContentInternal: {
        method: 'get',
        predicate: (path) => path.startsWith(CONNECT_BASE_URI) && LIST_CONTENT_INTERNAL_PATH.test(path),
        transport: {
            controller: 'ManagedContentController.getPublishedManagedContentListByContentKey',
        },
    },
    listContent: {
        method: 'get',
        predicate: (path) => path.startsWith(CONNECT_BASE_URI) && LIST_CONTENT_PATH.test(path),
        transport: {
            controller: 'ManagedContentController.getManagedContentByTopicsAndContentKeys',
        },
    },
    getRecordSeoProperties: {
        method: 'get',
        predicate: (path) => path.startsWith(CONNECT_BASE_URI) && RECORD_SEO_PROPERTIES_PATH.test(path),
        transport: {
            controller: 'SeoPropertiesController.getRecordSeoProperties',
        },
    },
    getOrchestrationInstance: {
        method: 'get',
        predicate: (path) => path.startsWith(CONNECT_BASE_URI) && GET_ORCHESTRATION_INSTANCE_PATH.test(path),
        transport: {
            controller: 'OrchestrationController.getOrchestrationInstance',
        },
    },
    getOrchestrationInstanceCollection: {
        method: 'get',
        predicate: (path) => path.startsWith(CONNECT_BASE_URI) &&
            GET_ORCHESTRATION_INSTANCE_COLLECTION_PATH.test(path),
        transport: {
            controller: 'OrchestrationController.getOrchestrationInstanceCollection',
        },
    },
    publishOrchestrationEvent: {
        method: 'post',
        predicate: (path) => path.startsWith(CONNECT_BASE_URI) && PUBLISH_ORCHESTRATION_EVENT_PATH.test(path),
        transport: {
            controller: 'OrchestrationController.publishOrchestrationEvent',
        },
    },
    searchSite: {
        method: 'get',
        predicate: (path) => path.startsWith(CONNECT_BASE_URI) && SITES_SEARCH_PATH.test(path),
        transport: {
            controller: 'SitesController.searchSite',
        },
    },
};
const commerce = {
    getProduct: {
        method: 'get',
        predicate: (path) => path.startsWith(COMMERCE_BASE_URI) && GET_PRODUCT_PATH.test(path),
        transport: {
            controller: 'CommerceCatalogController.getProduct',
        },
    },
    getProductCategoryPath: {
        method: 'get',
        predicate: (path) => path.startsWith(COMMERCE_BASE_URI) && GET_PRODUCT_CATEGORY_PATH_PATH.test(path),
        transport: {
            controller: 'CommerceCatalogController.getProductCategoryPath',
        },
    },
    getProductPrice: {
        method: 'get',
        predicate: (path) => path.startsWith(COMMERCE_BASE_URI) && GET_PRODUCT_PRICE_PATH.test(path),
        transport: {
            controller: 'CommerceStorePricingController.getProductPrice',
        },
    },
    productSearch: {
        method: 'post',
        predicate: (path) => path.startsWith(COMMERCE_BASE_URI) && PRODUCT_SEARCH_PATH.test(path),
        transport: {
            controller: 'CommerceProductSearchController.productSearch',
        },
    },
};
const guidance = {
    getGuidanceAssistant: {
        method: 'get',
        predicate: (path) => path.startsWith(GUIDANCE_BASE_URI) && GET_GUIDANCE_ASSISTANT_PATH.test(path),
        transport: {
            controller: 'LightningExperienceAssistantPlatformController.getAssistant',
        },
    },
    saveGuidanceAssistant: {
        method: 'patch',
        predicate: (path) => path.startsWith(GUIDANCE_BASE_URI) && GET_GUIDANCE_ASSISTANT_PATH.test(path),
        transport: {
            controller: 'LightningExperienceAssistantPlatformController.saveAssistant',
        },
    },
    getGuidanceActiveQuestionnaires: {
        method: 'get',
        predicate: (path) => path.startsWith(GUIDANCE_BASE_URI) &&
            GET_GUIDANCE_ACTIVE_QUESTIONNAIRES_PATH.test(path),
        transport: {
            controller: 'LightningExperienceAssistantPlatformController.getActiveQuestionnaires',
        },
    },
    getGuidanceQuestionnaire: {
        method: 'get',
        predicate: (path) => path.startsWith(GUIDANCE_BASE_URI) && GET_GUIDANCE_QUESTIONNAIRE_PATH.test(path),
        transport: {
            controller: 'LightningExperienceAssistantPlatformController.getQuestionnaire',
        },
    },
    saveGuidanceQuestionnaire: {
        method: 'patch',
        predicate: (path) => path.startsWith(GUIDANCE_BASE_URI) && GET_GUIDANCE_QUESTIONNAIRE_PATH.test(path),
        transport: {
            controller: 'LightningExperienceAssistantPlatformController.saveQuestionnaire',
        },
    },
    getGuidanceActiveScenarios: {
        method: 'get',
        predicate: (path) => path.startsWith(GUIDANCE_BASE_URI) && GET_GUIDANCE_ACTIVE_SCENARIOS_PATH.test(path),
        transport: {
            controller: 'LightningExperienceAssistantPlatformController.getActiveScenarios',
        },
    },
};
const analytics = {
    executeQuery: {
        method: 'post',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && EXECUTE_QUERY_PATH.test(path),
        transport: {
            controller: 'WaveController.executeQueryByInputRep',
        },
    },
    getAnalyticsLimits: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && ANALYTICS_LIMITS_PATH.test(path),
        transport: {
            controller: 'WaveController.getAnalyticsLimits',
        },
    },
    createDataflowJob: {
        method: 'post',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && DATAFLOW_JOBS_PATH.test(path),
        transport: {
            controller: 'WaveController.startDataflow',
        },
    },
    getDataflowJobs: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && DATAFLOW_JOBS_PATH.test(path),
        transport: {
            controller: 'WaveController.getDataflowJobs',
        },
    },
    getDataflowJob: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && DATAFLOW_JOB_PATH.test(path),
        transport: {
            controller: 'WaveController.getDataflowJob',
        },
    },
    updateDataflowJob: {
        method: 'patch',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && DATAFLOW_JOB_PATH.test(path),
        transport: {
            controller: 'WaveController.updateDataflowJob',
        },
    },
    getDataflowJobNodes: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && DATAFLOW_JOB_NODES_PATH.test(path),
        transport: {
            controller: 'WaveController.getDataflowJobNodes',
        },
    },
    getDataflowJobNode: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && DATAFLOW_JOB_NODE_PATH.test(path),
        transport: {
            controller: 'WaveController.getDataflowJobNode',
        },
    },
    getRecipe: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && RECIPE_PATH.test(path),
        transport: {
            controller: 'WaveController.getRecipe',
        },
    },
    getRecipes: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && RECIPES_PATH.test(path),
        transport: {
            controller: 'WaveController.getRecipes',
        },
    },
    getSchedule: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && SCHEDULE_PATH.test(path),
        transport: {
            controller: 'WaveController.getSchedule',
        },
    },
    updateSchedule: {
        method: 'put',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && SCHEDULE_PATH.test(path),
        transport: {
            controller: 'WaveController.updateSchedule',
        },
    },
    getDataset: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && DATASET_PATH.test(path),
        transport: {
            controller: 'WaveController.getDataset',
        },
    },
    deleteDataset: {
        method: 'delete',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && DATASET_PATH.test(path),
        transport: {
            controller: 'WaveController.deleteDataset',
        },
    },
    getDatasets: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && DATASETS_PATH.test(path),
        transport: {
            controller: 'WaveController.getDatasets',
        },
    },
    getXmd: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && XMD_PATH.test(path),
        transport: {
            controller: 'WaveController.getXmd',
        },
    },
    deleteRecipe: {
        method: 'delete',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && RECIPE_PATH.test(path),
        transport: {
            controller: 'WaveController.deleteRecipe',
        },
    },
    getReplicatedDatasets: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && REPLICATED_DATASETS_PATH.test(path),
        transport: {
            controller: 'WaveController.getReplicatedDatasets',
        },
    },
    getWaveFolders: {
        method: 'get',
        predicate: (path) => path.startsWith(WAVE_BASE_URI) && WAVE_FOLDERS_PATH.test(path),
        transport: {
            controller: 'WaveController.getWaveFolders',
        },
    },
};
registerApiFamilyRoutes(connect);
registerApiFamilyRoutes(commerce);
registerApiFamilyRoutes(guidance);
registerApiFamilyRoutes(analytics);

const UI_API_BASE_URI = '/services/data/v53.0/ui-api';
const ACTION_CONFIG = {
    background: false,
    hotspot: true,
    longRunning: false,
};
const actionConfig = {
    action: ACTION_CONFIG,
};

// Boundary which represents the limit that we start chunking at,
// determined by comma separated string length of fields
const MAX_STRING_LENGTH_PER_CHUNK = 10000;
const referenceId = 'LDS_Records_AggregateUi';
function createOkResponse$1(body) {
    return new AuraFetchResponse(HttpStatusCode.Ok, body);
}
function isSpanningRecord(fieldValue) {
    return fieldValue !== null && typeof fieldValue === 'object';
}
function mergeRecordFields(first, second) {
    const { fields: targetFields } = first;
    const { fields: sourceFields } = second;
    const fieldNames = keys(sourceFields);
    for (let i = 0, len = fieldNames.length; i < len; i += 1) {
        const fieldName = fieldNames[i];
        const sourceField = sourceFields[fieldName];
        const targetField = targetFields[fieldName];
        if (isSpanningRecord(sourceField.value)) {
            if (targetField === undefined) {
                targetFields[fieldName] = sourceFields[fieldName];
                continue;
            }
            mergeRecordFields(targetField.value, sourceField.value);
            continue;
        }
        targetFields[fieldName] = sourceFields[fieldName];
    }
    return first;
}
/** Invoke executeAggregateUi Aura controller.  This is only to be used with large getRecord requests that
 *  would otherwise cause a query length exception.
 */
function dispatchSplitRecordAggregateUiAction(endpoint, params, config = {}, recordId, instrumentationCallbacks = {}) {
    const { action: actionConfig } = config;
    return executeGlobalController(endpoint, params, actionConfig).then((body) => {
        // This response body could be an executeAggregateUi, which we don't natively support.
        // Massage it into looking like a getRecord response.
        if (body === null ||
            body === undefined ||
            body.compositeResponse === undefined ||
            body.compositeResponse.length === 0) {
            // We shouldn't even get into this state - a 200 with no body?
            throw new AuraFetchResponse(HttpStatusCode.ServerError, {
                error: 'No response body in executeAggregateUi found',
            });
        }
        const merged = body.compositeResponse.reduce((seed, response) => {
            if (response.httpStatusCode !== HttpStatusCode.Ok) {
                if (instrumentationCallbacks.rejectFn) {
                    instrumentationCallbacks.rejectFn({
                        params: { recordId },
                    });
                }
                throw new AuraFetchResponse(HttpStatusCode.ServerError, {
                    error: response.message,
                });
            }
            if (seed === null) {
                return response.body;
            }
            return mergeRecordFields(seed, response.body);
        }, null);
        if (instrumentationCallbacks.resolveFn) {
            instrumentationCallbacks.resolveFn({
                body: merged,
                params: { recordId },
            });
        }
        return createOkResponse$1(merged);
    }, err => {
        if (instrumentationCallbacks && instrumentationCallbacks.rejectFn) {
            instrumentationCallbacks.rejectFn({
                err,
                params: { recordId },
            });
        }
        // Handle ConnectedInJava exception shapes
        if (err.data !== undefined && err.data.statusCode !== undefined) {
            const { data } = err;
            throw new AuraFetchResponse(data.statusCode, data);
        }
        // Handle all the other kind of errors
        throw new AuraFetchResponse(HttpStatusCode.ServerError, {
            error: err.message,
        });
    });
}
function buildAggregateUiUrl(params, resourceRequest) {
    const { fields, optionalFields } = params;
    const queryString = [];
    if (fields !== undefined && fields.length > 0) {
        const fieldString = join.call(fields, ',');
        push.call(queryString, `fields=${fieldString}`);
    }
    if (optionalFields !== undefined && optionalFields.length > 0) {
        const optionalFieldString = join.call(optionalFields, ',');
        push.call(queryString, `optionalFields=${optionalFieldString}`);
    }
    return `${resourceRequest.baseUri}${resourceRequest.basePath}?${join.call(queryString, '&')}`;
}
function buildGetRecordByFieldsCompositeRequest(recordId, resourceRequest, recordsCompositeRequest) {
    const { fieldsArray, optionalFieldsArray, fieldsLength, optionalFieldsLength, } = recordsCompositeRequest;
    // Formula:  # of fields per chunk = floor(avg field length / max length per chunk)
    const averageFieldStringLength = Math.floor((fieldsLength + optionalFieldsLength) / (fieldsArray.length + optionalFieldsArray.length));
    const fieldsPerChunk = Math.floor(MAX_STRING_LENGTH_PER_CHUNK / averageFieldStringLength);
    const fieldsChunks = [];
    const optionalFieldsChunks = [];
    for (let i = 0, j = fieldsArray.length; i < j; i += fieldsPerChunk) {
        const newChunk = fieldsArray.slice(i, i + fieldsPerChunk);
        push.call(fieldsChunks, newChunk);
    }
    for (let i = 0, j = optionalFieldsArray.length; i < j; i += fieldsPerChunk) {
        const newChunk = optionalFieldsArray.slice(i, i + fieldsPerChunk);
        push.call(optionalFieldsChunks, newChunk);
    }
    const compositeRequest = [];
    for (let i = 0, len = fieldsChunks.length; i < len; i += 1) {
        const fieldChunk = fieldsChunks[i];
        const url = buildAggregateUiUrl({
            recordId,
            fields: fieldChunk,
        }, resourceRequest);
        push.call(compositeRequest, {
            url,
            referenceId: `${referenceId}_fields_${i}`,
        });
    }
    for (let i = 0, len = optionalFieldsChunks.length; i < len; i += 1) {
        const fieldChunk = optionalFieldsChunks[i];
        const url = buildAggregateUiUrl({
            recordId,
            optionalFields: fieldChunk,
        }, resourceRequest);
        push.call(compositeRequest, {
            url,
            referenceId: `${referenceId}_optionalFields_${i}`,
        });
    }
    return compositeRequest;
}
function shouldUseAggregateUiForGetRecord(fieldsArray, optionalFieldsArray) {
    return fieldsArray.length + optionalFieldsArray.length >= MAX_STRING_LENGTH_PER_CHUNK;
}

var CrudEventType;
(function (CrudEventType) {
    CrudEventType["CREATE"] = "create";
    CrudEventType["DELETE"] = "delete";
    CrudEventType["READ"] = "read";
    CrudEventType["READS"] = "reads";
    CrudEventType["UPDATE"] = "update";
})(CrudEventType || (CrudEventType = {}));
var CrudEventState;
(function (CrudEventState) {
    CrudEventState["ERROR"] = "ERROR";
    CrudEventState["SUCCESS"] = "SUCCESS";
})(CrudEventState || (CrudEventState = {}));
const forceRecordTransactionsDisabled = getEnvironmentSetting(EnvironmentSettings.ForceRecordTransactionsDisabled);

var UiApiRecordController;
(function (UiApiRecordController) {
    UiApiRecordController["CreateRecord"] = "RecordUiController.createRecord";
    UiApiRecordController["DeleteRecord"] = "RecordUiController.deleteRecord";
    UiApiRecordController["ExecuteAggregateUi"] = "RecordUiController.executeAggregateUi";
    UiApiRecordController["GetLayout"] = "RecordUiController.getLayout";
    UiApiRecordController["GetLayoutUserState"] = "RecordUiController.getLayoutUserState";
    UiApiRecordController["GetRecordAvatars"] = "RecordUiController.getRecordAvatars";
    UiApiRecordController["GetRecordTemplateClone"] = "RecordUiController.getRecordDefaultsTemplateClone";
    UiApiRecordController["GetRecordTemplateCreate"] = "RecordUiController.getRecordDefaultsTemplateForCreate";
    UiApiRecordController["GetRecordCreateDefaults"] = "RecordUiController.getRecordCreateDefaults";
    UiApiRecordController["GetRecordUi"] = "RecordUiController.getRecordUis";
    UiApiRecordController["GetRecordWithFields"] = "RecordUiController.getRecordWithFields";
    UiApiRecordController["GetRecordsWithFields"] = "RecordUiController.getRecordsWithFields";
    UiApiRecordController["GetRecordWithLayouts"] = "RecordUiController.getRecordWithLayouts";
    UiApiRecordController["GetObjectInfo"] = "RecordUiController.getObjectInfo";
    UiApiRecordController["GetObjectInfos"] = "RecordUiController.getObjectInfos";
    UiApiRecordController["GetPicklistValues"] = "RecordUiController.getPicklistValues";
    UiApiRecordController["GetPicklistValuesByRecordType"] = "RecordUiController.getPicklistValuesByRecordType";
    UiApiRecordController["UpdateRecord"] = "RecordUiController.updateRecord";
    UiApiRecordController["UpdateRecordAvatar"] = "RecordUiController.postRecordAvatarAssociation";
    UiApiRecordController["UpdateLayoutUserState"] = "RecordUiController.updateLayoutUserState";
    UiApiRecordController["GetDuplicateConfiguration"] = "RecordUiController.getDuplicateConfig";
    UiApiRecordController["GetDuplicates"] = "RecordUiController.findDuplicates";
})(UiApiRecordController || (UiApiRecordController = {}));
const UIAPI_GET_LAYOUT = `${UI_API_BASE_URI}/layout/`;
const UIAPI_RECORDS_PATH = `${UI_API_BASE_URI}/records`;
const UIAPI_RECORDS_BATCH_PATH = `${UI_API_BASE_URI}/records/batch/`;
const UIAPI_RECORD_AVATARS_BASE = `${UI_API_BASE_URI}/record-avatars/`;
const UIAPI_RECORD_AVATARS_BATCH_PATH = `${UI_API_BASE_URI}/record-avatars/batch/`;
const UIAPI_RECORD_AVATAR_UPDATE = `/association`;
const UIAPI_RECORD_TEMPLATE_CLONE_PATH = `${UI_API_BASE_URI}/record-defaults/template/clone/`;
const UIAPI_RECORD_TEMPLATE_CREATE_PATH = `${UI_API_BASE_URI}/record-defaults/template/create/`;
const UIAPI_RECORD_CREATE_DEFAULTS_PATH = `${UI_API_BASE_URI}/record-defaults/create/`;
const UIAPI_RECORD_UI_PATH = `${UI_API_BASE_URI}/record-ui/`;
const UIAPI_GET_LAYOUT_USER_STATE = '/user-state';
const UIAPI_OBJECT_INFO_PATH = `${UI_API_BASE_URI}/object-info/`;
const UIAPI_OBJECT_INFO_BATCH_PATH = `${UI_API_BASE_URI}/object-info/batch/`;
const UIAPI_DUPLICATE_CONFIGURATION_PATH = `${UI_API_BASE_URI}/duplicates/`;
const UIAPI_DUPLICATES_PATH = `${UI_API_BASE_URI}/predupe`;
let crudInstrumentationCallbacks = null;
if (forceRecordTransactionsDisabled === false) {
    crudInstrumentationCallbacks = {
        createRecordRejectFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.CREATE, {
                recordId: config.params.recordInput.apiName,
                state: CrudEventState.ERROR,
            });
        },
        createRecordResolveFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.CREATE, {
                recordId: config.body.id,
                recordType: config.body.apiName,
                state: CrudEventState.SUCCESS,
            });
        },
        deleteRecordRejectFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.DELETE, {
                recordId: config.params.recordId,
                state: CrudEventState.ERROR,
            });
        },
        deleteRecordResolveFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.DELETE, {
                recordId: config.params.recordId,
                state: CrudEventState.SUCCESS,
            });
        },
        getRecordAggregateRejectFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.READ, {
                recordId: config.params.recordId,
                state: CrudEventState.ERROR,
            });
        },
        getRecordAggregateResolveFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.READ, {
                recordId: config.params.recordId,
                recordType: config.body.apiName,
                state: CrudEventState.SUCCESS,
            });
        },
        getRecordRejectFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.READ, {
                recordId: config.params.recordId,
                state: CrudEventState.ERROR,
            });
        },
        getRecordResolveFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.READ, {
                recordId: config.params.recordId,
                recordType: config.body.apiName,
                state: CrudEventState.SUCCESS,
            });
        },
        updateRecordRejectFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.UPDATE, {
                recordId: config.params.recordId,
                state: CrudEventState.ERROR,
            });
        },
        updateRecordResolveFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.UPDATE, {
                recordId: config.params.recordId,
                recordType: config.body.apiName,
                state: CrudEventState.SUCCESS,
            });
        },
    };
}
const objectInfoStorage = createStorage({
    name: 'ldsObjectInfo',
    expiration: 5 * 60,
});
const objectInfoStorageStatsLogger = registerLdsCacheStats('getObjectInfo:storage');
const layoutStorage = createStorage({
    name: 'ldsLayout',
    expiration: 15 * 60,
});
const layoutStorageStatsLogger = registerLdsCacheStats('getLayout:storage');
const layoutUserStateStorage = createStorage({
    name: 'ldsLayoutUserState',
    expiration: 15 * 60,
});
const layoutUserStateStorageStatsLogger = registerLdsCacheStats('getLayoutUserState:storage');
function getObjectInfo(resourceRequest, cacheKey) {
    const params = buildUiApiParams({
        objectApiName: resourceRequest.urlParams.objectApiName,
    }, resourceRequest);
    const config = { ...actionConfig };
    if (objectInfoStorage !== null) {
        config.cache = {
            storage: objectInfoStorage,
            key: cacheKey,
            statsLogger: objectInfoStorageStatsLogger,
            forceRefresh: shouldForceRefresh(resourceRequest),
        };
    }
    return dispatchAction(UiApiRecordController.GetObjectInfo, params, config);
}
function getObjectInfos(resourceRequest, cacheKey) {
    const params = buildUiApiParams({
        objectApiNames: resourceRequest.urlParams.objectApiNames,
    }, resourceRequest);
    const config = { ...actionConfig };
    if (objectInfoStorage !== null) {
        config.cache = {
            storage: objectInfoStorage,
            key: cacheKey,
            statsLogger: objectInfoStorageStatsLogger,
            forceRefresh: shouldForceRefresh(resourceRequest),
        };
    }
    return dispatchAction(UiApiRecordController.GetObjectInfos, params, config);
}
function getRecord(resourceRequest) {
    const { urlParams, queryParams } = resourceRequest;
    const { recordId } = urlParams;
    const { fields, layoutTypes, modes, optionalFields } = queryParams;
    const fieldsArray = fields !== undefined && isArray(fields) ? fields : [];
    const optionalFieldsArray = optionalFields !== undefined && Array.isArray(optionalFields)
        ? optionalFields
        : [];
    const fieldsString = fieldsArray.join(',');
    const optionalFieldsString = optionalFieldsArray.join(',');
    // Don't submit a megarequest to UIAPI due to SOQL limit reasons.
    // Split and aggregate if needed
    const useAggregateUi = shouldUseAggregateUiForGetRecord(fieldsString, optionalFieldsString);
    if (useAggregateUi) {
        incrementGetRecordAggregateInvokeCount();
        const compositeRequest = buildGetRecordByFieldsCompositeRequest(recordId, resourceRequest, {
            fieldsArray,
            optionalFieldsArray,
            fieldsLength: fieldsString.length,
            optionalFieldsLength: optionalFieldsString.length,
        });
        const aggregateUiParams = {
            input: {
                compositeRequest,
            },
        };
        const instrumentationCallbacks = crudInstrumentationCallbacks !== null
            ? {
                rejectFn: crudInstrumentationCallbacks.getRecordAggregateRejectFunction,
                resolveFn: crudInstrumentationCallbacks.getRecordAggregateResolveFunction,
            }
            : {};
        setAggregateUiChunkCountMetric(compositeRequest.length);
        return dispatchSplitRecordAggregateUiAction(UiApiRecordController.ExecuteAggregateUi, aggregateUiParams, actionConfig, recordId, instrumentationCallbacks);
    }
    let getRecordParams = {};
    let controller;
    incrementGetRecordNormalInvokeCount();
    if (layoutTypes !== undefined) {
        getRecordParams = {
            recordId,
            layoutTypes,
            modes,
            optionalFields,
        };
        controller = UiApiRecordController.GetRecordWithLayouts;
    }
    else {
        getRecordParams = {
            recordId,
            fields,
            optionalFields,
        };
        controller = UiApiRecordController.GetRecordWithFields;
    }
    const params = buildUiApiParams(getRecordParams, resourceRequest);
    const instrumentationCallbacks = crudInstrumentationCallbacks !== null
        ? {
            rejectFn: crudInstrumentationCallbacks.getRecordRejectFunction,
            resolveFn: crudInstrumentationCallbacks.getRecordResolveFunction,
        }
        : {};
    return dispatchAction(controller, params, actionConfig, instrumentationCallbacks);
}
function getRecords(resourceRequest) {
    const { urlParams, queryParams } = resourceRequest;
    const { recordIds } = urlParams;
    const { fields, optionalFields } = queryParams;
    // Note: in getRecords batch case, we don't use the aggregate UI hack.
    const getRecordsParams = {
        recordIds,
        fields,
        optionalFields,
    };
    const params = buildUiApiParams(getRecordsParams, resourceRequest);
    return dispatchAction(UiApiRecordController.GetRecordsWithFields, params, actionConfig);
}
function createRecord(resourceRequest) {
    const { body, queryParams: { useDefaultRule, triggerUserEmail, triggerOtherEmail }, } = resourceRequest;
    const params = buildUiApiParams({
        useDefaultRule,
        triggerOtherEmail,
        triggerUserEmail,
        recordInput: body,
    }, resourceRequest);
    const instrumentationCallbacks = crudInstrumentationCallbacks !== null
        ? {
            rejectFn: crudInstrumentationCallbacks.createRecordRejectFunction,
            resolveFn: crudInstrumentationCallbacks.createRecordResolveFunction,
        }
        : {};
    return dispatchAction(UiApiRecordController.CreateRecord, params, actionConfig, instrumentationCallbacks);
}
function deleteRecord(resourceRequest) {
    const { urlParams } = resourceRequest;
    const params = buildUiApiParams({
        recordId: urlParams.recordId,
    }, resourceRequest);
    const instrumentationCallbacks = crudInstrumentationCallbacks !== null
        ? {
            rejectFn: crudInstrumentationCallbacks.deleteRecordRejectFunction,
            resolveFn: crudInstrumentationCallbacks.deleteRecordResolveFunction,
        }
        : {};
    return dispatchAction(UiApiRecordController.DeleteRecord, params, actionConfig, instrumentationCallbacks);
}
function updateRecord(resourceRequest) {
    const { body, urlParams, queryParams: { useDefaultRule, triggerUserEmail, triggerOtherEmail }, } = resourceRequest;
    const params = buildUiApiParams({
        useDefaultRule,
        triggerOtherEmail,
        triggerUserEmail,
        recordId: urlParams.recordId,
        recordInput: body,
    }, resourceRequest);
    const instrumentationCallbacks = crudInstrumentationCallbacks !== null
        ? {
            rejectFn: crudInstrumentationCallbacks.updateRecordRejectFunction,
            resolveFn: crudInstrumentationCallbacks.updateRecordResolveFunction,
        }
        : {};
    return dispatchAction(UiApiRecordController.UpdateRecord, params, actionConfig, instrumentationCallbacks);
}
function updateLayoutUserState(resourceRequest) {
    const { body, urlParams: { objectApiName }, queryParams: { layoutType, mode, recordTypeId }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        layoutType,
        mode,
        recordTypeId,
        userState: body,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController.UpdateLayoutUserState, params, actionConfig).then(response => {
        // TODO: Instead of surgically evicting the record that has been updated in the cache we
        // currently dump all the entries. We need a way to recreate the same cache key between
        // getLayoutUserState and updateLayoutUserState.
        if (layoutUserStateStorage !== null) {
            try {
                layoutUserStateStorage.clear();
            }
            catch (error) {
                /* noop */
            }
        }
        return response;
    });
}
function getRecordAvatars(resourceRequest) {
    const { urlParams } = resourceRequest;
    const recordIds = urlParams.recordIds;
    const params = buildUiApiParams({ recordIds }, resourceRequest);
    return dispatchAction(UiApiRecordController.GetRecordAvatars, params, actionConfig);
}
function updateRecordAvatar(resourceRequest) {
    const { urlParams, body } = resourceRequest;
    const params = buildUiApiParams({ input: body, recordId: urlParams.recordId }, resourceRequest);
    return dispatchAction(UiApiRecordController.UpdateRecordAvatar, params, actionConfig);
}
function getRecordUi(resourceRequest) {
    const { urlParams: { recordIds }, queryParams: { layoutTypes, modes, optionalFields }, } = resourceRequest;
    const params = buildUiApiParams({
        layoutTypes,
        modes,
        optionalFields,
        recordIds,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController.GetRecordUi, params, actionConfig);
}
function getPicklistValues(resourceRequest) {
    const { urlParams } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName: urlParams.objectApiName,
        recordTypeId: urlParams.recordTypeId,
        fieldApiName: urlParams.fieldApiName,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController.GetPicklistValues, params, actionConfig);
}
function getPicklistValuesByRecordType(resourceRequest) {
    const { urlParams: { objectApiName, recordTypeId }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        recordTypeId,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController.GetPicklistValuesByRecordType, params, actionConfig);
}
function getLayout(resourceRequest, cacheKey) {
    const { urlParams: { objectApiName }, queryParams: { layoutType, mode, recordTypeId }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        layoutType,
        mode,
        recordTypeId,
    }, resourceRequest);
    const config = { ...actionConfig };
    if (layoutStorage !== null) {
        config.cache = {
            storage: layoutStorage,
            key: cacheKey,
            statsLogger: layoutStorageStatsLogger,
            forceRefresh: shouldForceRefresh(resourceRequest),
        };
    }
    return dispatchAction(UiApiRecordController.GetLayout, params, config);
}
function getLayoutUserState(resourceRequest, cacheKey) {
    const { urlParams: { objectApiName }, queryParams: { layoutType, mode, recordTypeId }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        layoutType,
        mode,
        recordTypeId,
    }, resourceRequest);
    const config = { ...actionConfig };
    if (layoutUserStateStorage !== null) {
        config.cache = {
            storage: layoutUserStateStorage,
            key: cacheKey,
            statsLogger: layoutUserStateStorageStatsLogger,
            forceRefresh: shouldForceRefresh(resourceRequest),
        };
    }
    return dispatchAction(UiApiRecordController.GetLayoutUserState, params, config);
}
function getRecordTemplateClone(resourceRequest) {
    const { urlParams: { recordId }, queryParams: { optionalFields, recordTypeId }, } = resourceRequest;
    const params = buildUiApiParams({
        recordId,
        recordTypeId,
        optionalFields,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController.GetRecordTemplateClone, params, actionConfig);
}
function getRecordTemplateCreate(resourceRequest) {
    const { urlParams: { objectApiName }, queryParams: { optionalFields, recordTypeId }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        recordTypeId,
        optionalFields,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController.GetRecordTemplateCreate, params, actionConfig);
}
function getRecordCreateDefaults(resourceRequest) {
    const { urlParams: { objectApiName }, queryParams: { formFactor, optionalFields, recordTypeId }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        formFactor,
        recordTypeId,
        optionalFields,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController.GetRecordCreateDefaults, params, actionConfig);
}
function getDuplicateConfiguration(resourceRequest) {
    const params = buildUiApiParams({
        objectApiName: resourceRequest.urlParams.objectApiName,
        recordTypeId: resourceRequest.queryParams.recordTypeId,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController.GetDuplicateConfiguration, params, actionConfig);
}
function getDuplicates(resourceRequest) {
    const { body } = resourceRequest;
    const params = buildUiApiParams({
        recordInput: body,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController.GetDuplicates, params, actionConfig);
}
router.delete((path) => path.startsWith(UIAPI_RECORDS_PATH), deleteRecord);
router.patch((path) => path.startsWith(UIAPI_RECORDS_PATH), updateRecord);
router.patch((path) => path.startsWith(UIAPI_GET_LAYOUT) && path.endsWith(UIAPI_GET_LAYOUT_USER_STATE), updateLayoutUserState);
router.post((path) => path === UIAPI_RECORDS_PATH, createRecord);
router.post((path) => path.startsWith(UIAPI_RECORD_AVATARS_BASE) && path.endsWith(UIAPI_RECORD_AVATAR_UPDATE), updateRecordAvatar);
router.get((path) => path.startsWith(UIAPI_GET_LAYOUT) && path.endsWith(UIAPI_GET_LAYOUT_USER_STATE), getLayoutUserState);
router.get((path) => path.startsWith(UIAPI_GET_LAYOUT) && path.endsWith(UIAPI_GET_LAYOUT_USER_STATE) === false, getLayout);
// object-info/batch/
router.get((path) => path.startsWith(UIAPI_OBJECT_INFO_BATCH_PATH), getObjectInfos);
// object-info/API_NAME/picklist-values/RECORD_TYPE_ID/FIELD_API_NAME
router.get((path) => path.startsWith(UIAPI_OBJECT_INFO_PATH) &&
    /picklist-values\/[a-zA-Z\d]+\/[a-zA-Z\d]+/.test(path), getPicklistValues);
// object-info/API_NAME/picklist-values/RECORD_TYPE_ID
router.get((path) => path.startsWith(UIAPI_OBJECT_INFO_PATH) && /picklist-values\/[a-zA-Z\d]+/.test(path), getPicklistValuesByRecordType);
router.get((path) => path.startsWith(UIAPI_OBJECT_INFO_PATH) &&
    path.startsWith(UIAPI_OBJECT_INFO_BATCH_PATH) === false &&
    /picklist-values\/[a-zA-Z\d]+\/[a-zA-Z\d]+/.test(path) === false &&
    /picklist-values\/[a-zA-Z\d]+/.test(path) === false, getObjectInfo);
router.get((path) => path.startsWith(UIAPI_RECORDS_BATCH_PATH), getRecords); // Must be registered before getRecord since they both begin with /records.
router.get((path) => path.startsWith(UIAPI_RECORDS_PATH), getRecord);
router.get((path) => path.startsWith(UIAPI_RECORD_TEMPLATE_CLONE_PATH), getRecordTemplateClone);
router.get((path) => path.startsWith(UIAPI_RECORD_TEMPLATE_CREATE_PATH), getRecordTemplateCreate);
router.get((path) => path.startsWith(UIAPI_RECORD_CREATE_DEFAULTS_PATH), getRecordCreateDefaults);
router.get((path) => path.startsWith(UIAPI_RECORD_AVATARS_BATCH_PATH), getRecordAvatars);
router.get((path) => path.startsWith(UIAPI_RECORD_UI_PATH), getRecordUi);
router.get((path) => path.startsWith(UIAPI_DUPLICATE_CONFIGURATION_PATH), getDuplicateConfiguration);
router.post((path) => path.startsWith(UIAPI_DUPLICATES_PATH), getDuplicates);

var UiApiActionsController;
(function (UiApiActionsController) {
    UiApiActionsController["GetLookupActions"] = "ActionsController.getLookupActions";
    UiApiActionsController["GetRecordActions"] = "ActionsController.getRecordActions";
    UiApiActionsController["GetRecordEditActions"] = "ActionsController.getRecordEditActions";
    UiApiActionsController["GetObjectCreateActions"] = "ActionsController.getObjectCreateActions";
    UiApiActionsController["GetRelatedListActions"] = "ActionsController.getRelatedListActions";
    UiApiActionsController["GetRelatedListsActions"] = "ActionsController.getRelatedListsActions";
    UiApiActionsController["GetRelatedListRecordActions"] = "ActionsController.getRelatedListRecordActions";
    UiApiActionsController["GetGlobalActions"] = "ActionsController.getGlobalActions";
    UiApiActionsController["GetQuickActionDefaults"] = "ActionsController.getQuickActionDefaults";
})(UiApiActionsController || (UiApiActionsController = {}));
const UIAPI_ACTIONS_LOOKUP_PATH = `${UI_API_BASE_URI}/actions/lookup/`;
const UIAPI_ACTIONS_RECORD_PATH = `${UI_API_BASE_URI}/actions/record/`;
const UIAPI_ACTIONS_GLOBAL_PATH = `${UI_API_BASE_URI}/actions/global`;
const UIAPI_ACTIONS_OBJECT_PATH = `${UI_API_BASE_URI}/actions/object/`;
const UIAPI_ACTIONS_RECORD_EDIT = '/record-edit';
const UIAPI_ACTIONS_RELATED_LIST = '/related-list/';
const UIAPI_ACTIONS_OBJECT_CREATE = '/record-create';
const UIAPI_ACTIONS_RELATED_LIST_BATCH = '/related-list/batch/';
const UIAPI_ACTIONS_RELATED_LIST_RECORD = '/related-list-record/';
const UIAPI_ACTIONS_QUICKACTION_DEFAULTS_PATH = `${UI_API_BASE_URI}/actions/record-defaults/`;
function getLookupActions(resourceRequest) {
    const { urlParams: { objectApiNames }, queryParams, } = resourceRequest;
    const parameters = buildUiApiParams({ objectApiNames, ...queryParams }, resourceRequest);
    return dispatchAction(UiApiActionsController.GetLookupActions, parameters);
}
function getRecordActions(resourceRequest) {
    const { urlParams: { recordIds }, queryParams, } = resourceRequest;
    const parameters = buildUiApiParams({ recordIds, ...queryParams }, resourceRequest);
    return dispatchAction(UiApiActionsController.GetRecordActions, parameters);
}
function getRecordEditActions(resourceRequest) {
    const { urlParams: { recordIds }, queryParams, } = resourceRequest;
    const parameters = buildUiApiParams({ recordIds, ...queryParams }, resourceRequest);
    return dispatchAction(UiApiActionsController.GetRecordEditActions, parameters);
}
function getRelatedListActions(resourceRequest) {
    const { urlParams: { recordIds, relatedListId }, queryParams, } = resourceRequest;
    const parameters = buildUiApiParams({ recordIds, relatedListId, ...queryParams }, resourceRequest);
    return dispatchAction(UiApiActionsController.GetRelatedListActions, parameters);
}
function getRelatedListsActions(resourceRequest) {
    const { urlParams: { recordIds, relatedListIds }, queryParams, } = resourceRequest;
    const parameters = buildUiApiParams({ recordIds, relatedListIds, ...queryParams }, resourceRequest);
    return dispatchAction(UiApiActionsController.GetRelatedListsActions, parameters);
}
function getRelatedListRecordActions(resourceRequest) {
    const { urlParams: { recordIds, relatedListRecordIds }, queryParams, } = resourceRequest;
    const parameters = buildUiApiParams({ recordIds, relatedListRecordIds, ...queryParams }, resourceRequest);
    return dispatchAction(UiApiActionsController.GetRelatedListRecordActions, parameters);
}
function getObjectCreateActions(resourceRequest) {
    const { urlParams: { objectApiName }, queryParams, } = resourceRequest;
    const parameters = buildUiApiParams({ objectApiName, ...queryParams }, resourceRequest);
    return dispatchAction(UiApiActionsController.GetObjectCreateActions, parameters);
}
function getGlobalActions(resourceRequest) {
    const { queryParams } = resourceRequest;
    const parameters = buildUiApiParams({ ...queryParams }, resourceRequest);
    return dispatchAction(UiApiActionsController.GetGlobalActions, parameters);
}
function getQuickActionDefaults(resourceRequest) {
    const { urlParams: { actionApiName }, queryParams, } = resourceRequest;
    const parameters = buildUiApiParams({ actionApiName, ...queryParams }, resourceRequest);
    return dispatchAction(UiApiActionsController.GetQuickActionDefaults, parameters);
}
router.get((path) => path.startsWith(UIAPI_ACTIONS_LOOKUP_PATH), getLookupActions);
router.get((path) => path.startsWith(UIAPI_ACTIONS_RECORD_PATH) && path.endsWith(UIAPI_ACTIONS_RECORD_EDIT), getRecordEditActions);
router.get((path) => path.startsWith(UIAPI_ACTIONS_RECORD_PATH) &&
    path.indexOf(UIAPI_ACTIONS_RELATED_LIST_RECORD) > 0, getRelatedListRecordActions);
router.get((path) => path.startsWith(UIAPI_ACTIONS_RECORD_PATH) &&
    path.indexOf(UIAPI_ACTIONS_RELATED_LIST) > 0 &&
    path.indexOf(UIAPI_ACTIONS_RELATED_LIST_BATCH) === -1, getRelatedListActions);
router.get((path) => path.startsWith(UIAPI_ACTIONS_RECORD_PATH) &&
    path.indexOf(UIAPI_ACTIONS_RELATED_LIST_BATCH) > 0, getRelatedListsActions);
router.get((path) => path.startsWith(UIAPI_ACTIONS_RECORD_PATH) &&
    path.indexOf(UIAPI_ACTIONS_RELATED_LIST) === -1 &&
    path.indexOf(UIAPI_ACTIONS_RELATED_LIST_RECORD) === -1 &&
    !path.endsWith(UIAPI_ACTIONS_RECORD_EDIT), getRecordActions);
router.get((path) => path.startsWith(UIAPI_ACTIONS_OBJECT_PATH) && path.indexOf(UIAPI_ACTIONS_OBJECT_CREATE) > 0, getObjectCreateActions);
router.get((path) => path.startsWith(UIAPI_ACTIONS_GLOBAL_PATH), getGlobalActions);
router.get((path) => path.startsWith(UIAPI_ACTIONS_QUICKACTION_DEFAULTS_PATH), getQuickActionDefaults);

var UiApiListsController;
(function (UiApiListsController) {
    UiApiListsController["GetListsByObjectName"] = "ListUiController.getListsByObjectName";
    UiApiListsController["GetListUiById"] = "ListUiController.getListUiById";
    UiApiListsController["GetListRecordsById"] = "ListUiController.getListRecordsById";
    UiApiListsController["GetListUiByName"] = "ListUiController.getListUiByName";
    UiApiListsController["GetListInfoByName"] = "ListUiController.getListInfoByName";
    UiApiListsController["GetListRecordsByName"] = "ListUiController.getListRecordsByName";
})(UiApiListsController || (UiApiListsController = {}));
const UIAPI_LIST_RECORDS_PATH = `${UI_API_BASE_URI}/list-records/`;
const UIAPI_LIST_UI_PATH = `${UI_API_BASE_URI}/list-ui/`;
const UIAPI_LIST_INFO_PATH = `${UI_API_BASE_URI}/list-info/`;
function getListRecordsByName(resourceRequest) {
    const { urlParams: { objectApiName, listViewApiName }, queryParams: { fields, optionalFields, pageSize, pageToken, sortBy }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        listViewApiName,
        fields,
        optionalFields,
        pageSize,
        pageToken,
        sortBy,
    }, resourceRequest);
    return dispatchAction(UiApiListsController.GetListRecordsByName, params);
}
function getListRecordsById(resourceRequest) {
    const { urlParams: { listViewId }, queryParams: { fields, optionalFields, pageSize, pageToken, sortBy }, } = resourceRequest;
    const params = buildUiApiParams({
        listViewId,
        fields,
        optionalFields,
        pageSize,
        pageToken,
        sortBy,
    }, resourceRequest);
    return dispatchAction(UiApiListsController.GetListRecordsById, params);
}
function getListUiByName(resourceRequest) {
    const { urlParams: { objectApiName, listViewApiName }, queryParams: { fields, optionalFields, pageSize, pageToken, sortBy }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        listViewApiName,
        fields,
        optionalFields,
        pageSize,
        pageToken,
        sortBy,
    }, resourceRequest);
    return dispatchAction(UiApiListsController.GetListUiByName, params);
}
function getListUiById(resourceRequest) {
    const { urlParams: { listViewId }, queryParams: { fields, optionalFields, pageSize, pageToken, sortBy }, } = resourceRequest;
    const params = buildUiApiParams({
        listViewId,
        fields,
        optionalFields,
        pageSize,
        pageToken,
        sortBy,
    }, resourceRequest);
    return dispatchAction(UiApiListsController.GetListUiById, params);
}
function getListInfoByName(resourceRequest) {
    const { urlParams: { objectApiName, listViewApiName }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        listViewApiName,
    }, resourceRequest);
    return dispatchAction(UiApiListsController.GetListInfoByName, params);
}
function getListsByObjectName(resourceRequest) {
    const { urlParams: { objectApiName }, queryParams: { pageSize, pageToken, q, recentListsOnly }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        pageSize,
        pageToken,
        q,
        recentListsOnly,
    }, resourceRequest);
    return dispatchAction(UiApiListsController.GetListsByObjectName, params);
}
// .../list-records/${objectApiName}/${listViewApiName}
router.get((path) => path.startsWith(UIAPI_LIST_RECORDS_PATH) && /list-records\/.*\//.test(path), getListRecordsByName);
// .../list-records/${listViewId}
router.get((path) => path.startsWith(UIAPI_LIST_RECORDS_PATH) && /list-records\/.*\//.test(path) === false, getListRecordsById);
// .../list-ui/${objectApiName}/${listViewApiName}
router.get((path) => path.startsWith(UIAPI_LIST_UI_PATH) && /list-ui\/.*\//.test(path), getListUiByName);
// .../list-ui/${listViewId}
router.get((path) => path.startsWith(UIAPI_LIST_UI_PATH) && /00B[a-zA-Z\d]{15}$/.test(path), getListUiById);
// .../list-ui/${objectApiName}
router.get((path) => path.startsWith(UIAPI_LIST_UI_PATH) &&
    /list-ui\/.*\//.test(path) === false &&
    /00B[a-zA-Z\d]{15}$/.test(path) === false, getListsByObjectName);
// .../list-info/${objectApiName}/${listViewApiName}
router.get((path) => path.startsWith(UIAPI_LIST_INFO_PATH) && /list-info\/.*\//.test(path), getListInfoByName);

const UIAPI_LOOKUP_RECORDS = `${UI_API_BASE_URI}/lookups`;
const LookupRecords = 'LookupController.getLookupRecords';
function lookupRecords(resourceRequest) {
    const { urlParams, queryParams } = resourceRequest;
    const params = buildUiApiParams({
        ...urlParams,
        ...queryParams,
    }, resourceRequest);
    return dispatchAction(LookupRecords, params);
}
router.get((path) => path.startsWith(UIAPI_LOOKUP_RECORDS), lookupRecords);

var UiApiMruListsController;
(function (UiApiMruListsController) {
    UiApiMruListsController["GetMruListUi"] = "MruListUiController.getMruListUi";
    UiApiMruListsController["GetMruListRecords"] = "MruListUiController.getMruListRecords";
})(UiApiMruListsController || (UiApiMruListsController = {}));
const UIAPI_MRU_LIST_RECORDS_PATH = `${UI_API_BASE_URI}/mru-list-records/`;
const UIAPI_MRU_LIST_UI_PATH = `${UI_API_BASE_URI}/mru-list-ui/`;
function getMruListRecords(resourceRequest) {
    const { urlParams: { objectApiName }, queryParams: { fields, optionalFields, pageSize, pageToken, sortBy }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        fields,
        optionalFields,
        pageSize,
        pageToken,
        sortBy,
    }, resourceRequest);
    return dispatchAction(UiApiMruListsController.GetMruListRecords, params);
}
function getMruListUi(resourceRequest) {
    const { urlParams: { objectApiName }, queryParams: { fields, optionalFields, pageSize, pageToken, sortBy }, } = resourceRequest;
    const params = buildUiApiParams({
        objectApiName,
        fields,
        optionalFields,
        pageSize,
        pageToken,
        sortBy,
    }, resourceRequest);
    return dispatchAction(UiApiMruListsController.GetMruListUi, params);
}
router.get((path) => path.startsWith(UIAPI_MRU_LIST_RECORDS_PATH), getMruListRecords);
router.get((path) => path.startsWith(UIAPI_MRU_LIST_UI_PATH), getMruListUi);

var UiApiRecordController$1;
(function (UiApiRecordController) {
    UiApiRecordController["GetRelatedListInfo"] = "RelatedListUiController.getRelatedListInfoByApiName";
    UiApiRecordController["UpdateRelatedListInfo"] = "RelatedListUiController.updateRelatedListInfoByApiName";
    UiApiRecordController["GetRelatedListsInfo"] = "RelatedListUiController.getRelatedListInfoCollection";
    UiApiRecordController["GetRelatedListRecords"] = "RelatedListUiController.getRelatedListRecords";
    UiApiRecordController["GetRelatedListCount"] = "RelatedListUiController.getRelatedListRecordCount";
    UiApiRecordController["GetRelatedListCounts"] = "RelatedListUiController.getRelatedListsRecordCount";
    UiApiRecordController["GetRelatedListInfoBatch"] = "RelatedListUiController.getRelatedListInfoBatch";
    UiApiRecordController["GetRelatedListRecordsBatch"] = "RelatedListUiController.getRelatedListRecordsBatch";
})(UiApiRecordController$1 || (UiApiRecordController$1 = {}));
const UIAPI_RELATED_LIST_INFO_PATH = `${UI_API_BASE_URI}/related-list-info`;
const UIAPI_RELATED_LIST_INFO_BATCH_PATH = `${UI_API_BASE_URI}/related-list-info/batch`;
const UIAPI_RELATED_LIST_RECORDS_PATH = `${UI_API_BASE_URI}/related-list-records`;
const UIAPI_RELATED_LIST_RECORDS_BATCH_PATH = `${UI_API_BASE_URI}/related-list-records/batch`;
const UIAPI_RELATED_LIST_COUNT_PATH = `${UI_API_BASE_URI}/related-list-count`;
let crudInstrumentationCallbacks$1 = null;
if (forceRecordTransactionsDisabled === false) {
    crudInstrumentationCallbacks$1 = {
        getRelatedListRecordsRejectFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.READS, {
                parentRecordId: config.params.parentRecordId,
                relatedListId: config.params.relatedListId,
                state: CrudEventState.ERROR,
            });
        },
        getRelatedListRecordsResolveFunction: (config) => {
            logGetRelatedListRecordsInteraction(config.body);
        },
        getRelatedListRecordsBatchRejectFunction: (config) => {
            logCRUDLightningInteraction(CrudEventType.READS, {
                parentRecordId: config.params.parentRecordId,
                relatedListIds: config.params.relatedListIds,
                state: CrudEventState.ERROR,
            });
        },
        getRelatedListRecordsBatchResolveFunction: (config) => {
            config.body.results.forEach(res => {
                // Log for each RL that was returned from batch endpoint
                if (res.statusCode === 200) {
                    logGetRelatedListRecordsInteraction(res.result);
                }
            });
        },
    };
}
function getRelatedListInfo(resourceRequest) {
    const { urlParams, queryParams } = resourceRequest;
    const params = buildUiApiParams({
        parentObjectApiName: urlParams.parentObjectApiName,
        relatedListId: urlParams.relatedListId,
        recordTypeId: queryParams.recordTypeId,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController$1.GetRelatedListInfo, params);
}
function updateRelatedListInfo(resourceRequest) {
    const { urlParams, queryParams, body } = resourceRequest;
    const params = buildUiApiParams({
        parentObjectApiName: urlParams.parentObjectApiName,
        relatedListId: urlParams.relatedListId,
        recordTypeId: queryParams.recordTypeId,
        relatedListInfoInput: {
            orderedByInfo: body.orderedByInfo,
            userPreferences: body.userPreferences,
        },
    }, resourceRequest);
    return dispatchAction(UiApiRecordController$1.UpdateRelatedListInfo, params);
}
function getRelatedListsInfo(resourceRequest) {
    const { urlParams, queryParams } = resourceRequest;
    const params = buildUiApiParams({
        parentObjectApiName: urlParams.parentObjectApiName,
        recordTypeId: queryParams.recordTypeId,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController$1.GetRelatedListsInfo, params);
}
function getRelatedListRecords(resourceRequest) {
    const { urlParams: { parentRecordId, relatedListId }, queryParams: { fields, optionalFields, pageSize, pageToken, sortBy }, } = resourceRequest;
    const params = buildUiApiParams({
        parentRecordId: parentRecordId,
        relatedListId: relatedListId,
        fields,
        optionalFields,
        pageSize,
        pageToken,
        sortBy,
    }, resourceRequest);
    const instrumentationCallbacks = crudInstrumentationCallbacks$1 !== null
        ? {
            rejectFn: crudInstrumentationCallbacks$1.getRelatedListRecordsRejectFunction,
            resolveFn: crudInstrumentationCallbacks$1.getRelatedListRecordsResolveFunction,
        }
        : {};
    return dispatchAction(UiApiRecordController$1.GetRelatedListRecords, params, undefined, instrumentationCallbacks);
}
function getRelatedListRecordsBatch(resourceRequest) {
    const { urlParams: { parentRecordId, relatedListIds }, queryParams: { fields, optionalFields, pageSize, sortBy }, } = resourceRequest;
    const params = buildUiApiParams({
        parentRecordId: parentRecordId,
        relatedListIds: relatedListIds,
        fields,
        optionalFields,
        pageSize,
        sortBy,
    }, resourceRequest);
    const instrumentationCallbacks = crudInstrumentationCallbacks$1 !== null
        ? {
            rejectFn: crudInstrumentationCallbacks$1.getRelatedListRecordsBatchRejectFunction,
            resolveFn: crudInstrumentationCallbacks$1.getRelatedListRecordsBatchResolveFunction,
        }
        : {};
    return dispatchAction(UiApiRecordController$1.GetRelatedListRecordsBatch, params, undefined, instrumentationCallbacks);
}
function getRelatedListCount(resourceRequest) {
    const { urlParams } = resourceRequest;
    const params = buildUiApiParams({
        parentRecordId: urlParams.parentRecordId,
        relatedListName: urlParams.relatedListName,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController$1.GetRelatedListCount, params);
}
function getRelatedListsCount(resourceRequest) {
    const { urlParams } = resourceRequest;
    const params = buildUiApiParams({
        parentRecordId: urlParams.parentRecordId,
        relatedListNames: urlParams.relatedListNames,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController$1.GetRelatedListCounts, params);
}
function getRelatedListInfoBatch(resourceRequest) {
    const { urlParams, queryParams } = resourceRequest;
    const params = buildUiApiParams({
        parentObjectApiName: urlParams.parentObjectApiName,
        relatedListNames: urlParams.relatedListNames,
        recordTypeId: queryParams.recordTypeId,
    }, resourceRequest);
    return dispatchAction(UiApiRecordController$1.GetRelatedListInfoBatch, params);
}
router.patch((path) => path.startsWith(UIAPI_RELATED_LIST_INFO_PATH), updateRelatedListInfo);
// related-list-info/batch/API_NAME/RELATED_LIST_IDS
router.get((path) => path.startsWith(UIAPI_RELATED_LIST_INFO_BATCH_PATH) &&
    /related-list-info\/batch\/[a-zA-Z_\d]+\/[a-zA-Z_\d]+/.test(path), getRelatedListInfoBatch);
// related-list-info/API_NAME/RELATED_LIST_ID
router.get((path) => path.startsWith(UIAPI_RELATED_LIST_INFO_PATH) &&
    /related-list-info\/[a-zA-Z_\d]+\/[a-zA-Z_\d]+/.test(path), getRelatedListInfo);
router.get((path) => path.startsWith(UIAPI_RELATED_LIST_INFO_PATH) &&
    /related-list-info\/[a-zA-Z_\d]+\/[a-zA-Z_\d]+/.test(path) === false, getRelatedListsInfo);
router.get((path) => path.startsWith(UIAPI_RELATED_LIST_RECORDS_PATH) &&
    path.startsWith(UIAPI_RELATED_LIST_RECORDS_BATCH_PATH) === false, getRelatedListRecords);
router.get((path) => path.startsWith(UIAPI_RELATED_LIST_RECORDS_BATCH_PATH), getRelatedListRecordsBatch);
// related-list-count/batch/parentRecordId/relatedListNames
router.get((path) => path.startsWith(UIAPI_RELATED_LIST_COUNT_PATH + '/batch'), getRelatedListsCount);
// related-list-count/parentRecordId/relatedListName
router.get((path) => path.startsWith(UIAPI_RELATED_LIST_COUNT_PATH) &&
    path.startsWith(UIAPI_RELATED_LIST_COUNT_PATH + '/batch') === false, getRelatedListCount);
function logGetRelatedListRecordsInteraction(body) {
    const records = body.records;
    // Don't log anything if the related list has no records.
    if (records.length === 0) {
        return;
    }
    const recordIds = records.map(record => {
        return record.id;
    });
    /**
     *  In almost every case - the relatedList records will all be of the same apiName, but there is an edge case for
        Activities entity that could return Events & Tasks- so handle that case by returning a joined string.
        ADS Implementation only looks at the first record returned to determine the apiName.
        See force/recordLibrary/recordMetricsPlugin.js _getRecordType method.
     */
    logCRUDLightningInteraction(CrudEventType.READS, {
        parentRecordId: body.listReference.inContextOfRecordId,
        relatedListId: body.listReference.relatedListId,
        recordIds,
        recordType: body.records[0].apiName,
        state: CrudEventState.SUCCESS,
    });
}

var UiApiAppsController;
(function (UiApiAppsController) {
    UiApiAppsController["GetNavItems"] = "AppsController.getNavItems";
})(UiApiAppsController || (UiApiAppsController = {}));
const UIAPI_NAV_ITEMS_PATH = `${UI_API_BASE_URI}/nav-items`;
function getNavItems(resourceRequest) {
    const { queryParams: { formFactor, page, pageSize, navItemNames }, } = resourceRequest;
    const params = buildUiApiParams({
        formFactor,
        page,
        pageSize,
        navItemNames,
    }, resourceRequest);
    return dispatchAction(UiApiAppsController.GetNavItems, params);
}
router.get((path) => path.startsWith(UIAPI_NAV_ITEMS_PATH), getNavItems);

const RATE_LIMIT_CONFIG = {
    bucketCapacity: 100,
    fillsPerSecond: 100,
};
class TokenBucket {
    /**
     * Constructs an instance of Token Bucket for rate limiting
     *
     * @param bucket The token holding capacity of the bucket
     * @param refillTokensPerSecond The number of tokens replenished every second
     */
    constructor(config) {
        this.bucketCapacity = config.bucketCapacity;
        this.refillTokensPerMilliSecond = config.fillsPerSecond / 1000;
        this.tokens = config.bucketCapacity;
        this.lastRefillTime = Date.now();
    }
    /**
     * Refills the bucket and removes desired number of tokens
     *
     * @param removeTokens number of tokens to be removed from the bucket should be >= 0
     * @returns {boolean} true if removing token was succesful
     */
    take(removeTokens) {
        // refill tokens before removing
        this.refill();
        const { tokens } = this;
        const remainingTokens = tokens - removeTokens;
        if (remainingTokens >= 0) {
            this.tokens = remainingTokens;
            return true;
        }
        return false;
    }
    refill() {
        const { bucketCapacity, tokens, refillTokensPerMilliSecond, lastRefillTime } = this;
        const now = Date.now();
        const timePassed = now - lastRefillTime;
        // Number of tokens should be integer so something like Math.floor is desired
        // Using Bitwise NOT ~ twice will achieve the same result with performance benefits
        const calculatedTokens = tokens + ~~(timePassed * refillTokensPerMilliSecond);
        this.tokens = bucketCapacity < calculatedTokens ? bucketCapacity : calculatedTokens;
        this.lastRefillTime = now;
    }
}
var tokenBucket = new TokenBucket(RATE_LIMIT_CONFIG);

function controllerInvokerFactory(resourceRequest) {
    const { baseUri, basePath, method } = resourceRequest;
    const path = `${baseUri}${basePath}`;
    const ret = router.lookup(resourceRequest);
    if (ret === null) {
        throw new Error(`No invoker matching controller factory: ${path} ${method}.`);
    }
    return ret;
}
function getFulfillingRequest(inflightRequests, resourceRequest) {
    const { fulfill } = resourceRequest;
    if (fulfill === undefined) {
        return null;
    }
    const handlersMap = entries(inflightRequests);
    for (let i = 0, len = handlersMap.length; i < len; i += 1) {
        const [transactionKey, handlers] = handlersMap[i];
        // check fulfillment against only the first handler ([0]) because it's equal or
        // fulfills all subsequent handlers in the array
        const existing = handlers[0].resourceRequest;
        if (fulfill(existing, resourceRequest) === true) {
            return transactionKey;
        }
    }
    return null;
}
function getTransactionKey(resourceRequest) {
    const { baseUri, basePath, queryParams, headers } = resourceRequest;
    const path = `${baseUri}${basePath}`;
    return `${path}::${stringify(headers)}::${queryParams ? stringify(queryParams) : ''}`;
}
const inflightRequests = Object.create(null);
function networkAdapter(resourceRequest) {
    const { method } = resourceRequest;
    const transactionKey = getTransactionKey(resourceRequest);
    const controllerInvoker = controllerInvokerFactory(resourceRequest);
    if (method !== 'get') {
        return controllerInvoker(resourceRequest, transactionKey);
    }
    // if an identical request is in-flight then queue for its response (do not re-issue the request)
    if (transactionKey in inflightRequests) {
        return new Promise((resolve, reject) => {
            push.call(inflightRequests[transactionKey], {
                resolve,
                reject,
                resourceRequest,
            });
        });
    }
    // fallback to checking a custom deduper to find a similar (but not identical) request
    const similarTransactionKey = getFulfillingRequest(inflightRequests, resourceRequest);
    if (similarTransactionKey !== null) {
        return new Promise(resolve => {
            // custom dedupers find similar (not identical) requests. if the similar request fails
            // there's no guarantee the deduped request should fail. thus we re-issue the
            // original request in the case of a failure
            function reissueRequest() {
                resolve(networkAdapter(resourceRequest));
            }
            push.call(inflightRequests[similarTransactionKey], {
                resolve,
                reject: reissueRequest,
                resourceRequest,
            });
        });
    }
    // not a duplicate request so invoke the network
    // when it resolves, clear the queue then invoke queued handlers
    // (must clear the queue first in case handlers re-invoke the network)
    controllerInvoker(resourceRequest, transactionKey).then(response => {
        const handlers = inflightRequests[transactionKey];
        delete inflightRequests[transactionKey];
        // handlers mutate responses so must clone the response for each.
        // the first handler is given the original version to avoid an
        // extra clone (particularly when there's only 1 handler).
        for (let i = 1, len = handlers.length; i < len; i++) {
            const handler = handlers[i];
            handler.resolve(parse(stringify(response)));
        }
        handlers[0].resolve(response);
    }, error => {
        const handlers = inflightRequests[transactionKey];
        delete inflightRequests[transactionKey];
        for (let i = 0, len = handlers.length; i < len; i++) {
            const handler = handlers[i];
            handler.reject(error);
        }
    });
    // rely on sync behavior of Promise creation to create the list for handlers
    return new Promise((resolve, reject) => {
        inflightRequests[transactionKey] = [{ resolve, reject, resourceRequest }];
    });
}
function networkAdapterWithRateLimitTelemetry(resourceRequest) {
    if (!tokenBucket.take(1)) {
        // We are hitting rate limiting, add some metrics
        incrementNetworkRateLimitExceededCount();
    }
    return networkAdapter(resourceRequest);
}

export default networkAdapterWithRateLimitTelemetry;
// version: 1.11.3-03778f23
