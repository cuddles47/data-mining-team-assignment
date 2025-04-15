import { EventEmitter } from 'events';

interface DemMatHang {
    [stringifiedItem: string]: number
}

export interface ISukienApriori<T> {
    on(event: 'data', listener: (tapmathangs: TapMatHang<T>) => void): this;
    on(event: string, listener: Function): this;
}

export interface IKetQuaApriori<T> {
    tapmathang: TapMatHang<T>[],
    thoigianthaotac: number
}

export interface TapMatHang<T> {
    mathang: T[],
    hotro: number
}

export class Apriori<T> extends EventEmitter implements ISukienApriori<T> {
    private _giaodich!: T[][];

    /**
     * Apriori is an algorithm for frequent item set mining and association rule
     * earning over transactional databases.
     * It proceeds by identifying the frequent individual items in the given set of transactions
     * and extending them to larger and larger item sets as long as those item sets appear
     * sufficiently often in the database.
     *
     * @param  {number} _hotro 0 < _hotro < 1. Minimum support of itemsets to mine.
     */
    constructor( private _hotro: number /*, private _tindung: number*/ ) {
        super();
    }

    /**
     * Executes the Apriori Algorithm.
     * You can keep track of frequent itemsets as they are mined by listening to the 'data' event on the Apriori object.
     * All mined itemsets, as well as basic execution stats, are returned at the end of the execution through a callback function or a Promise.
     *
     * @param  {T[][]}              giaodich The transactions from which you want to mine itemsets.
     * @param  {IKetQuaApriori<T>} cb           Callback function returning the results.
     * @return {Promise<IKetQuaApriori<T>>}     Promise returning the results.
     */
    public thucthi( giaodich: T[][], cb?: (result: IKetQuaApriori<T>) => any ): Promise<IKetQuaApriori<T>> {
        this._giaodich = giaodich;
        // Relative support.
        this._hotro = Math.ceil(this._hotro * giaodich.length);

        return new Promise<IKetQuaApriori<T>>( (resolve, reject) => {
            let thoigianbatdau = performance.now();

            // Generate frequent one-itemsets.
            let tapmathangphobien: TapMatHang<T>[][] = [ this.layTapMatHangMotPhoBien(this._giaodich) ];

            let i: number = 0;
            // Generate frequent (i+1)-itemsets.
            while( tapmathangphobien[i].length > 0 ) {
                tapmathangphobien.push( this.layTapMatHangKPhoBien(tapmathangphobien[i]) );
                i++;
            }

            let thoigianketthuc = performance.now();

            // Formatting results.
            let ketqua: IKetQuaApriori<T> = {
                tapmathang: tapmathangphobien.reduce((acc, val) => acc.concat(val), []),
                thoigianthaotac: Math.round(thoigianketthuc - thoigianbatdau)
            };

            if(cb) cb(ketqua);
            resolve(ketqua);
        });
    }

    /**
     * Returns frequent one-itemsets from a given set of transactions.
     *
     * @param  {T[][]}              giaodich Your set of transactions.
     * @return {TapMatHang<T>[]}       Frequent one-itemsets.
     */
    private layTapMatHangMotPhoBien( giaodich: T[][] ): TapMatHang<T>[] {
        // This generates one-itemset candidates.
        let dem: DemMatHang = this._layDemMatHangRieng(giaodich);

        return Object.keys(dem)
            .reduce<TapMatHang<T>[]>( (ret: TapMatHang<T>[], mathangchuoihoa: string) => {
                // Returning pruned one-itemsets.
                if( dem[mathangchuoihoa] >= this._hotro ) {
                    let tapmathangphobien: TapMatHang<T> = {
                        hotro: dem[mathangchuoihoa],
                        mathang: [JSON.parse(mathangchuoihoa)]
                    };
                    ret.push(tapmathangphobien);
                    this.emit('data', tapmathangphobien)
                }
                return ret;
            }, []);
    }

    /**
     * Returns frequent (k = n+1)-itemsets from a given array of frequent n-itemsets.
     *
     * @param  {TapMatHang<T>[]} tapmathangNphobien Previously determined n-itemsets.
     * @return {TapMatHang<T>[]}                   Frequent k-itemsets.
     */
    private layTapMatHangKPhoBien( tapmathangNphobien: TapMatHang<T>[] ): TapMatHang<T>[] {
        // Trivial precondition.
        if(!tapmathangNphobien.length) return [];

        // Size of frequent itemsets we want to determine.
        let k: number = tapmathangNphobien[0].mathang.length + 1;

        // Get unique items from these itemsets (Brute-force approach).
        let mathang: T[] = tapmathangNphobien
            .reduce<T[]>( (mathang: T[], tapmathang: TapMatHang<T>) => mathang.concat(tapmathang.mathang), [])
            .filter( (mathang: T, index: number, that: T[]) => that.indexOf(mathang) === index );

        // Generating candidates and counting their occurence.
        return this._layDemUngVien( this._taoUngVienK(mathang,k) )
            // Pruning candidates.
            .filter( (tapmathang: TapMatHang<T>) => {
                let laphobien: boolean = tapmathang.hotro >= this._hotro;
                if(laphobien) this.emit('data', tapmathang);
                return laphobien;
            });
    }

    /**
     * Returns all combinations (itemset candidates) of size k from a given set of items.
     *
     * @param  {T[]}    mathang The set of items of which you want the combinations.
     * @param  {number} k     Size of combinations you want.
     * @return {TapMatHang<T>[]} Array of itemset candidates.
     */
    private _taoUngVienK( mathang: T[], k: number): TapMatHang<T>[] {
        // Trivial preconditions over k.
        if(k > mathang.length || k <= 0) return [];
        if(k == mathang.length) return [{mathang: mathang, hotro: 0}];
        if(k == 1) return mathang.map( (mathang: T) => {
            return { mathang: [mathang], hotro: 0 };
        });

        let ketqua: TapMatHang<T>[] = [];
        for( let i: number = 0; i < mathang.length - k + 1; i++) {
            let dau: T[] = mathang.slice(i, i + 1);
            this._taoUngVienK(mathang.slice(i + 1), k - 1)
                .forEach( (kethopcuoi: TapMatHang<T>) => ketqua.push({
                    mathang: dau.concat(kethopcuoi.mathang),
                    hotro: 0
                }));
        }

        return ketqua;
    }

    /**
     * Populates an Itemset array with their support in the given set of transactions.
     *
     * @param  {TapMatHang<T>[]} ungvien The itemset candidates to populate with their support.
     * @return {TapMatHang<T>[]}            The support-populated collection of itemsets.
     */
    private _layDemUngVien( ungvien: TapMatHang<T>[] ): TapMatHang<T>[] {
        this._giaodich.forEach( (giaodich: T[]) => {
            ungvien.forEach( (ungvien: TapMatHang<T>) => {
                let baogomsungvien: boolean = ungvien.mathang.every( (mathang: T) => giaodich.indexOf(mathang) !== -1 );
                if(baogomsungvien) ungvien.hotro += 1;
            })
        });
        return ungvien;
    }

    /**
     * Returns the occurence of single items in a given set of transactions.
     *
     * @param  {T[][]}      giaodich The set of transaction.
     * @return {DemMatHang}              Count of items (stringified items as keys).
     */
    private _layDemMatHangRieng( giaodich: T[][] ): DemMatHang {
        return giaodich.reduce<DemMatHang>( (dem: DemMatHang, arr: T[]) => {
            return arr.reduce<DemMatHang>( (dem: DemMatHang, mathang: T) => {
                dem[JSON.stringify(mathang)] = (dem[JSON.stringify(mathang)] || 0) + 1;
                return dem;
            }, dem);
        }, {});
    }
}
