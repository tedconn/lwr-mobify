import { getService as getPageService } from "force/pageService";
import { getService as getNavService } from "laf/navigationService";
// eslint-disable-next-line lwc-core/no-wire-service
import { register, ValueChangedEvent } from "wire-service";

function assertIsLightningElementSubclass(Base) {
    const baseProto = Base.prototype;
    if (typeof baseProto.dispatchEvent !== "function") {
        throw new TypeError(`${Base} must be an Element type`);
    }
}

const Navigate = Symbol("Navigate");
const GenerateUrl = Symbol("GenerateUrl");

export const NavigationMixin = (Base) => {
    assertIsLightningElementSubclass(Base);
    return class extends Base {
        [Navigate](pageReference, replace) {
            getNavService(this).navigateTo(pageReference, {replace});
        }

        [GenerateUrl](pageReference) {
            return getNavService(this).generateUrl(pageReference);
        }
    };
};
NavigationMixin.Navigate = Navigate;
NavigationMixin.GenerateUrl = GenerateUrl;

/*
 * Services @wire(CurrentPageReference) requests.
 */
export const CurrentPageReference = () => {
    throw new Error("Imperative use is not supported. Use @wire(CurrentPageReference).");
};

register(CurrentPageReference, wiredEventTarget => {
    let subscription;

    const observer = {
        next: data => wiredEventTarget.dispatchEvent(new ValueChangedEvent(data))
    };

    wiredEventTarget.addEventListener("connect", () => {
        if (subscription) {
            return;
        }
        const observable = getPageService(wiredEventTarget).getCurrentPageReference();
        if (observable) {
            subscription = observable.subscribe(observer);
        }
    });

    wiredEventTarget.addEventListener("disconnect", () => {
        if (subscription) {
            subscription.unsubscribe();
            subscription = undefined;
        }
    });
});