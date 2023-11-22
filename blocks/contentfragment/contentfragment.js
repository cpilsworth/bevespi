export default async function decorate(block) {
    const isUE = isUniversalEditorActive();
    const persistedQuery = (isUE) ? useAuthorQuery(block.textContent) : block.textContent;
    const category = await getCategory(persistedQuery);
    console.dir(category);
    
    const root = document.createElement('div');
    root.setAttribute("class", "category-list");
    
    const elem = document.createElement('div');
    elem.setAttribute("class", "category-item");
    elem.setAttribute("itemscope", "");
    elem.setAttribute("itemid", `urn:aemconnection:${category._path}/jcr:content/data/master`);                                 
    elem.setAttribute("itemtype", "reference");
    elem.setAttribute("itemfilter", "cf");
    elem.innerHTML = `
        <div class="category-item-content">
            <h2 class="category-item-title" data-editor-itemlabel="Title" itemprop="title" itemtype="text">${category.title}</h2>
            <div class="category-item-desc" data-editor-itemlabel="Information" itemprop="description" itemtype="richtext">${category.information}</div>
        </div>`;
    root.appendChild(elem);
    block.textContent = "";
    block.append(root);

    // const meta = document.createElement('meta');
    // meta.name = "urn:adobe:aue:system:aemconnection";
    // meta.content="aem:https://author-p31359-e804016.adobeaemcloud.com";
    // meta['data-rh'] = "true";
    // document.head.appendChild(meta);
}

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} Category
 * @property {string} _path - Path to the category content fragment.
 * @property {string} title - Title of the category.
 * @property {string} description - Description of the category.
 * @property {string} ctaText - Call to action text.
 * @property {string} ctaLink - Call to action link.
 * @property {URL} image - Image for the category.
 */

/**
 * @async
 * @param {string} persistedQuery
 * @return {Promise<Category[]>} results 
 */
async function getCategory(persistedQuery) {
    const url = addCacheKiller(persistedQuery);

    const json = await fetch(url, {
        credentials: "include"
    }).then((response) => response.json());
    let item = json?.data?.safetyinformationByPath?.item;
    item.information = item.information.html;
    return item;
}
/**
 * Detects whether the site is embedded in the universal editor by counting parent frames
 * @returns {boolean}
 */
function isUniversalEditorActive() {
    return window.location.ancestorOrigins?.length > 0;
}

/**
 * Update the persisted query url to use the authoring endpoint
 * @param {string} persistedQuery 
 * @returns {string}
 */
function useAuthorQuery(persistedQuery) {
    return persistedQuery.replace("//publish-", "//author-");
}

/**
 * Updates url to contain a query parameter to prevent caching
 * @param {string} url 
 * @returns url with cache killer query parameter
 */
function addCacheKiller(url) {
    let newUrl = new URL(url);
    let params = newUrl.searchParams;
    params.append("ck", Date.now());
    return newUrl.toString();
}
