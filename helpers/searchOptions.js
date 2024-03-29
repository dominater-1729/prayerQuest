class SearchOptions {
    constructor(query) {
        this.limit = query.limit ? parseInt(query.limit) : null;
        this.skip = (query.page && this.limit) ? (parseInt(query.page) - 1) * this.limit : null;
        this.sort = {};

        if (query.sortBy) {
            const sortStr = query.sortBy.split(':');
            this.sort[sortStr[0]] = sortStr[1] === 'desc' ? -1 : 1
        }
    }
}

module.exports = SearchOptions;